const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// Exemple de contrôleur dashboard simulé
const dashboardController = {
  getDashboard: (req, res) => {
    const { role, organization_id } = req.user;
    const normalizedRole = String(role || '').toLowerCase();

    let response = {};

    if (normalizedRole === 'superadmin' || normalizedRole === 'super_admin') {
      // Superadmin voit tout
      response = {
        message: "Tableau de bord Super Admin",
        modules: ['users', 'operators', 'debug', 'global_reports', 'settings']
      };
    } else if (normalizedRole === 'admin') {
      // Admin limité à son organisation
      response = {
        message: `Tableau de bord Admin pour organisation ${organization_id}`,
        modules: ['users', 'operators', 'basic_reports']
      };
    } else {
      // Autres rôles (operator, user, passager)
      response = {
        message: "Tableau de bord utilisateur",
        modules: ['basic_reports']
      };
    }

    res.json(response);
  }
};

// Route dashboard accessible aux admins et superadmins
router.get('/',
  verifyJWT,
  requireRole(['admin', 'super_admin']),
  dashboardController.getDashboard
);

// Route spécifique superadmin uniquement (ex: debug avancé)
router.get('/super',
  verifyJWT,
  requireRole('super_admin'),
  (req, res) => res.json({
    message: "Accès réservé au Super Admin",
    modules: ['users', 'operators', 'debug', 'global_reports', 'settings', 'logs']
  })
);

module.exports = router;
