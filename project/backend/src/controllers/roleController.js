const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = require('../config/env');
const axios = require('axios');
const { ROLE_HIERARCHY } = require('../middleware/roles');

// Liste des rôles disponibles
const getAvailableRoles = (req, res) => {
  try {
    const roles = Object.keys(ROLE_HIERARCHY).map(role => ({
      name: role,
      level: ROLE_HIERARCHY[role],
      description: getRoleDescription(role)
    }));
    
    res.json({ roles });
  } catch (error) {
    console.error('Erreur lors de la récupération des rôles:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Mettre à jour le rôle d'un utilisateur (seul un utilisateur avec un rôle supérieur peut modifier)
async function updateUserRole(req, res) {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const currentUserRole = req.user.role;
    
    // Vérifier que le rôle demandé est valide
    if (!ROLE_HIERARCHY[role]) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }
    
    // Vérifier que l'utilisateur a les droits nécessaires
    if (ROLE_HIERARCHY[currentUserRole] <= ROLE_HIERARCHY[role]) {
      return res.status(403).json({ 
        error: 'Vous ne pouvez pas attribuer un rôle supérieur ou égal au vôtre' 
      });
    }
    
    // Mettre à jour le rôle dans la base de données
    const { data, error } = await axios.patch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
      { role },
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        }
      }
    );
    
    if (error) throw error;
    
    res.json({ 
      message: 'Rôle mis à jour avec succès',
      user: data[0]
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour du rôle',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Fonction utilitaire pour obtenir la description d'un rôle
function getRoleDescription(role) {
  const descriptions = {
    'super_admin': 'Accès complet à toutes les fonctionnalités du système',
    'admin': 'Gestion des utilisateurs et des opérations',
    'operator': 'Gestion des opérations courantes',
    'user': 'Utilisateur standard avec accès limité'
  };
  
  return descriptions[role] || 'Rôle non défini';
}

module.exports = {
  getAvailableRoles,
  updateUserRole,
  getRoleDescription
};
