const { getDashboardByRole } = require('../utils/roleUtils');

/**
 * Récupère les informations du tableau de bord pour l'utilisateur connecté
 */
const getDashboard = (req, res) => {
  try {
    const userRole = req.user?.role || 'user';
    const dashboard = getDashboardByRole(userRole);
    
    // Informations supplémentaires spécifiques au rôle
    const dashboardData = {
      ...dashboard,
      lastLogin: req.user?.last_login || null,
      notifications: [],
      quickActions: []
    };
    
    // Personnaliser les données en fonction du rôle
    switch (userRole) {
      case 'super_admin':
        dashboardData.quickActions = [
          { title: 'Gérer les administrateurs', path: '/admin/manage', icon: 'users' },
          { title: 'Voir les statistiques', path: '/admin/stats', icon: 'bar-chart' },
          { title: 'Paramètres système', path: '/admin/settings', icon: 'settings' }
        ];
        break;
        
      case 'admin':
        dashboardData.quickActions = [
          { title: 'Gérer les opérateurs', path: '/admin/operators', icon: 'user-check' },
          { title: 'Voir les réservations', path: '/admin/bookings', icon: 'calendar' },
          { title: 'Rapports', path: '/admin/reports', icon: 'file-text' }
        ];
        break;
        
      case 'operator':
        dashboardData.quickActions = [
          { title: 'Nouvelle réservation', path: '/operator/booking/new', icon: 'plus-circle' },
          { title: 'Véhicules', path: '/operator/vehicles', icon: 'truck' },
          { title: 'Profil', path: '/operator/profile', icon: 'user' }
        ];
        break;
        
      default: // user
        dashboardData.quickActions = [
          { title: 'Nouvelle réservation', path: '/booking/new', icon: 'plus-circle' },
          { title: 'Mes trajets', path: '/my-trips', icon: 'map' },
          { title: 'Mon profil', path: '/profile', icon: 'user' }
        ];
    }
    
    res.json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du tableau de bord:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du tableau de bord'
    });
  }
};

/**
 * Vérifie si l'utilisateur a accès à une route spécifique
 */
const checkRouteAccess = (req, res) => {
  try {
    const { path } = req.query;
    const userRole = req.user?.role || 'guest';
    
    // Cette logique peut être plus sophistiquée selon vos besoins
    const hasAccess = true; // À implémenter avec votre logique spécifique
    
    res.json({
      success: true,
      data: {
        hasAccess,
        userRole,
        requiredRole: 'N/A' // Peut être personnalisé selon la route
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la vérification des droits d\'accès:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification des droits d\'accès'
    });
  }
};

module.exports = {
  getDashboard,
  checkRouteAccess
};
