const { getDashboardByRole } = require('../utils/roleUtils');

/**
 * Contrôleur pour la page d'accueil
 */

/**
 * Affiche la page d'accueil avec les options de connexion et d'inscription
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const getHomePage = (req, res) => {
  // Si l'utilisateur est déjà connecté, le rediriger vers son tableau de bord
  if (req.user) {
    const { role } = req.user;
    const dashboardPaths = {
      'super_admin': '/admin/super',
      'admin': '/admin/dashboard',
      'operator': '/operator/dashboard',
      'user': '/passager/dashboard'
    };
    
    return res.redirect(dashboardPaths[role] || '/');
  }

  // Données pour la page d'accueil
  const features = [
    {
      title: 'Réservation facile',
      description: 'Réservez vos trajets en quelques clics avec notre interface intuitive.',
      icon: 'calendar-check'
    },
    {
      title: 'Paiement sécurisé',
      description: 'Paiement en ligne sécurisé avec nos partenaires de confiance.',
      icon: 'shield-alt'
    },
    {
      title: 'Suivi en temps réel',
      description: 'Suivez votre véhicule en temps réel sur la carte.',
      icon: 'map-marker-alt'
    },
    {
      title: 'Chauffeurs vérifiés',
      description: 'Tous nos chauffeurs sont soigneusement sélectionnés et vérifiés.',
      icon: 'user-check'
    },
    {
      title: 'Service client 24/7',
      description: 'Notre équipe est disponible 24h/24 et 7j/7 pour vous aider.',
      icon: 'headset'
    },
    {
      title: 'Prix transparents',
      description: 'Pas de frais cachés, vous connaissez le prix à l\'avance.',
      icon: 'receipt'
    }
  ];

  // Rendre la page d'accueil avec les données
  res.render('home', {
    title: 'Accueil',
    features,
    isAuthenticated: false
  });
};

module.exports = {
  getHomePage
};
