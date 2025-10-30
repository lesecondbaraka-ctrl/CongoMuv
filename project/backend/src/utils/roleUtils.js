const { ROLE_HIERARCHY } = require('../middleware/roles');

/**
 * Normalise le rôle (ex : "Super Admin", "admin") en minuscule, sans espace.
 * @param {string} role 
 */
function normalizeRole(role) {
  return String(role || '').trim().toLowerCase().replace(/\s+/g, '_');
}

/**
 * Tableau de bord en fonction du rôle (super admin peut tout voir)
 */
const dashboards = {
  super_admin: {
    path: '/admin/super',
    name: 'Tableau Super Admin',
    requiresSetup: false,
  },
  superadmin: {
    path: '/admin/super',
    name: 'Tableau Super Admin',
    requiresSetup: false,
  },
  admin: {
    path: '/admin/dashboard',
    name: 'Tableau Admin',
    requiresSetup: false,
  },
  operator: {
    path: '/operator/dashboard',
    name: 'Tableau Opérateur',
    requiresSetup: false,
  },
  user: {
    path: '/passager/dashboard',
    name: 'Espace Passager',
    requiresSetup: false,
  },
  passenger: {
    path: '/passager/dashboard',
    name: 'Espace Passager',
    requiresSetup: false,
  }
};

/**
 * Retourne le chemin du dashboard par rôle
 * @param {string} role
 * @returns {Object} {path, name, requiresSetup}
 */
function getDashboardByRole(role) {
  const normalizedRole = normalizeRole(role);
  const defaultDashboard = {
    path: '/',
    name: 'Accueil',
    requiresSetup: false,
  };
  return dashboards[normalizedRole] || defaultDashboard;
}

/**
 * Vérifie l'accès en fonction du rôle et des droits sur l'organisation
 * @param {object} user {role, organization_id}
 * @param {string|Array} requiredRoles Les rôles autorisés
 * @param {string|null} routeOrganizationId Organisation liée à la ressource/route
 * @returns {boolean}
 */
function hasRoleAccess(user, requiredRoles, routeOrganizationId = null) {
  if (!user || !user.role) return false;

  const normalizedUserRole = normalizeRole(user.role);
  const requiredRolesArr = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  // Seul le super admin a accès global (pas d'organisation)
  if (normalizedUserRole === 'superadmin' || normalizedUserRole === 'super_admin') {
    return true;
  }

  // Pour un admin lambda : il doit correspondre et être dans la bonne organisation
  if (requiredRolesArr.some(role => normalizeRole(role) === 'admin')) {
    if (normalizedUserRole === 'admin' && user.organization_id) {
      return routeOrganizationId === user.organization_id;
    }
    return false;
  }

  // Autres rôles classiques
  const userLevel = ROLE_HIERARCHY[normalizedUserRole] || 0;
  return requiredRolesArr.some(role => {
    const reqRole = normalizeRole(role);
    const reqLevel = ROLE_HIERARCHY[reqRole] || 0;
    return userLevel >= reqLevel;
  });
}

module.exports = {
  getDashboardByRole,
  hasRoleAccess,
  normalizeRole,
};
