const jwt = require('jsonwebtoken');
const axios = require('axios');
const env = require('../config/env');
const { ROLE_HIERARCHY } = require('./roles');

// Middleware pour vérifier le JWT et extraire les informations utilisateur
function verifyJWT(req, res, next) {
  try {
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token manquant' });
    
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const userRole = (decoded.role || 'user').toLowerCase();
    
    // Vérifier si le rôle est valide
    if (!ROLE_HIERARCHY[userRole]) {
      console.warn(`Rôle non reconnu: ${userRole}`);
      return res.status(401).json({ error: 'Rôle utilisateur non valide' });
    }
    
    // Ajouter les informations utilisateur à la requête
    req.user = {
      ...decoded,
      role: userRole,
      hasRole: (requiredRoles) => {
        if (!Array.isArray(requiredRoles)) requiredRoles = [requiredRoles];
        return requiredRoles.some(role => 
          ROLE_HIERARCHY[userRole] >= (ROLE_HIERARCHY[role] || 0)
        );
      }
    };
    
    next();
  } catch (e) {
    console.error('Erreur de vérification du token:', e.message);
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

// Hiérarchie des rôles (du plus permissif au moins permissif)
// const ROLE_HIERARCHY = {
//   'superadmin': 100,    // Accès complet à tout le système
//   'admin': 80,          // Gestion des opérateurs et passagers
//   'operator': 60,       // Gestion des réservations
//   'user': 40,           // Utilisateur enregistré
//   'passenger': 20       // Passager occasionnel
// };

function requireRole(...roles) {
  return async (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Accès refusé: rôle manquant' });
    }

    // Normaliser le rôle en minuscules pour la correspondance
    const userRole = String(req.user.role).toLowerCase();
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    
    // Vérifier si l'utilisateur a un rôle suffisant
    const hasAccess = roles.some(requiredRole => {
      const normalizedRole = String(requiredRole).toLowerCase();
      const requiredLevel = ROLE_HIERARCHY[normalizedRole] || 0;
      return userLevel >= requiredLevel;
    });

    if (!hasAccess) {
      console.warn(`Accès refusé pour le rôle: ${userRole}. Rôles requis: ${roles.join(', ')}`);
      return res.status(403).json({ 
        error: 'Accès refusé',
        requiredRoles: roles,
        currentRole: userRole
      });
    }
    
    next();
  };
}

module.exports = { 
  verifyJWT, 
  authenticateToken: verifyJWT, // Alias pour compatibilité
  requireRole 
};
 
// Ensure non-SUPER_ADMIN requests are scoped to an organization
async function fetchOrgIdByEmail(email) {
  try {
    const { data } = await axios.get(`${env.SUPABASE_URL}/rest/v1/profiles`, {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      params: {
        select: 'organization_id',
        email: `eq.${email}`,
        limit: 1
      }
    });
    if (Array.isArray(data) && data.length && data[0]?.organization_id) return String(data[0].organization_id);
  } catch (e) {
    // ignore
  }
  return null;
}

async function ensureOrgScoped(req, res, next) {
  try {
    const role = String(req.user?.role || '').toUpperCase();
    if (role === 'SUPER_ADMIN') {
      req.scopeOrgId = null; // full access
      return next();
    }
    const email = String(req.user?.email || '').toLowerCase();
    let orgId = req.user?.organizationId || null;
    if (!orgId && email) {
      orgId = await fetchOrgIdByEmail(email);
    }
    if (!orgId) {
      return res.status(403).json({ error: 'Organisation requise pour cette action' });
    }
    req.scopeOrgId = String(orgId);
    return next();
  } catch (e) {
    return res.status(500).json({ error: 'Erreur de portée organisationnelle' });
  }
}

module.exports.ensureOrgScoped = ensureOrgScoped;
