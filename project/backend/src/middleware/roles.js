const { verifyJWT } = require('./auth');
const jwt = require('jsonwebtoken');

// Hiérarchie des rôles (du plus permissif au moins permissif)
const ROLE_HIERARCHY = {
  'super_admin': 1000,
  'admin': 100,
  'operator': 50,
  'user': 10
};

// Vérifie si l'utilisateur a un des rôles requis
const hasRole = (userRoles = [], requiredRoles = []) => {
  if (!Array.isArray(userRoles)) userRoles = [userRoles];
  if (!Array.isArray(requiredRoles)) requiredRoles = [requiredRoles];
  
  return userRoles.some(userRole => {
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    return requiredRoles.some(requiredRole => {
      const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
      return userLevel >= requiredLevel;
    });
  });
};

// Middleware pour vérifier les rôles
const requireRole = (...roles) => {
  return (req, res, next) => {
    try {
      // Si l'utilisateur n'est pas défini, vérifier le JWT d'abord
      if (!req.user) {
        const auth = req.headers['authorization'] || '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
        
        if (!token) {
          return res.status(401).json({ error: 'Token manquant' });
        }
        
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          req.user = {
            ...decoded,
            role: (decoded.role || 'user').toLowerCase()
          };
        } catch (e) {
          return res.status(401).json({ error: 'Token invalide ou expiré' });
        }
      }
      
      const userRole = req.user.role?.toLowerCase() || 'user';
      
      // Vérifier si l'utilisateur a un des rôles requis
      const hasAccess = roles.some(role => 
        ROLE_HIERARCHY[userRole] >= (ROLE_HIERARCHY[role] || 0)
      );
      
      if (!hasAccess) {
        console.warn('Accès refusé - Rôle insuffisant', { 
          user: req.user.email, 
          role: userRole, 
          required: roles 
        });
        return res.status(403).json({ 
          error: 'Accès refusé - Droits insuffisants',
          requiredRoles: roles,
          currentRole: userRole
        });
      }
      
      next();
    } catch (error) {
      console.error('Erreur de vérification des rôles:', error);
      return res.status(500).json({ error: 'Erreur de vérification des autorisations' });
    }
  };
};

module.exports = {
  ROLE_HIERARCHY,
  hasRole,
  requireRole
};
