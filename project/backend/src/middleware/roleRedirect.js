const { getDashboardByRole, hasRoleAccess } = require('../utils/roleUtils');

/**
 * Middleware pour rediriger les utilisateurs non autorisés
 * @param {Array} allowedRoles - Tableau des rôles autorisés à accéder à la route
 * @param {Object} options - Options supplémentaires
 * @param {string} options.redirectPath - Chemin de redirection personnalisé (optionnel)
 * @param {boolean} options.apiRoute - Si true, renvoie une erreur JSON au lieu d'une redirection
 * @returns {Function} Middleware Express
 */
const roleRedirect = (allowedRoles = [], options = {}) => {
  return (req, res, next) => {
    const userRole = req.user?.role || 'guest';
    const hasAccess = hasRoleAccess(userRole, allowedRoles);
    
    // Si l'utilisateur a accès, passer au middleware suivant
    if (hasAccess) {
      return next();
    }
    
    // Si c'est une API, renvoyer une erreur 403
    if (options.apiRoute || req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous ne disposez pas des autorisations nécessaires pour accéder à cette ressource.',
        requiredRoles: allowedRoles,
        currentRole: userRole
      });
    }
    
    // Sinon, rediriger vers le tableau de bord approprié
    const dashboard = getDashboardByRole(userRole);
    const redirectPath = options.redirectPath || dashboard.path;
    
    res.redirect(redirectPath);
  };
};

/**
 * Middleware pour forcer la redirection vers le tableau de bord approprié
 * Utile pour les routes racines ou les pages d'accueil
 */
const redirectToDashboard = (req, res, next) => {
  if (!req.user) {
    return next();
  }
  
  const dashboard = getDashboardByRole(req.user.role);
  res.redirect(dashboard.path);
};

module.exports = {
  roleRedirect,
  redirectToDashboard
};
