// Utilitaires pour la gestion des rôles et des redirections
const { ROLE_HIERARCHY } = require('../middleware/roles');

/**
 * Retourne le tableau de bord par défaut en fonction du rôle de l'utilisateur
 * @param {string} role - Le rôle de l'utilisateur
 * @returns {Object} Un objet contenant le chemin de redirection et le nom du tableau de bord
 */
const getDashboardByRole = (role) => {
  const defaultDashboard = {
    path: '/',
    name: 'Accueil',
    requiresSetup: false
  };

  const dashboards = {
    'super_admin': {
      path: '/admin/super',
      name: 'Tableau de bord Super Admin',
      requiresSetup: false
    },
    'admin': {
      path: '/admin/dashboard',
      name: 'Tableau de bord Admin',
      requiresSetup: false
    },
    'operator': {
      path: '/operator/dashboard',
      name: 'Tableau de bord Opérateur',
      requiresSetup: false
    },
    'user': {
      path: '/passager/dashboard',
      name: 'Mon Espace Passager',
      requiresSetup: false
    }
  };

  return dashboards[role] || defaultDashboard;
};

/**
 * Vérifie si un utilisateur a accès à une route spécifique
 * @param {string} userRole - Le rôle de l'utilisateur
 * @param {string|Array} requiredRoles - Rôle(s) requis pour accéder à la route
 * @returns {boolean} true si l'utilisateur a accès, false sinon
 */
const hasRoleAccess = (userRole, requiredRoles) => {
  if (!userRole) return false;
  if (!requiredRoles) return true;
  
  const requiredRolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  
  return requiredRolesArray.some(role => {
    const requiredLevel = ROLE_HIERARCHY[role] || 0;
    return userLevel >= requiredLevel;
  });
};

module.exports = {
  getDashboardByRole,
  hasRoleAccess
};
