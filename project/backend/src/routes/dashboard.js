const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const { roleRedirect } = require('../middleware/roleRedirect');
const dashboardController = require('../controllers/dashboardController');

// Récupérer le tableau de bord de l'utilisateur connecté
router.get('/me', verifyJWT, dashboardController.getDashboard);

// Vérifier l'accès à une route spécifique
router.get('/check-access', verifyJWT, dashboardController.checkRouteAccess);

// Redirection vers le tableau de bord approprié
router.get('/', verifyJWT, (req, res) => {
  const { role } = req.user || {};
  
  // Rediriger vers le tableau de bord par défaut selon le rôle
  switch (role) {
    case 'super_admin':
      return res.redirect('/admin/super');
    case 'admin':
      return res.redirect('/admin/dashboard');
    case 'operator':
      return res.redirect('/operator/dashboard');
    case 'user':
    default:
      return res.redirect('/passager/dashboard');
  }
});

// Exemple de route protégée par rôle
router.get('/admin/dashboard', 
  verifyJWT, 
  roleRedirect(['admin', 'super_admin']),
  (req, res) => {
    res.json({
      success: true,
      message: 'Bienvenue sur le tableau de bord administrateur',
      user: req.user
    });
  }
);

// Exemple de route pour les opérateurs
router.get('/operator/dashboard',
  verifyJWT,
  roleRedirect(['operator', 'admin', 'super_admin']),
  (req, res) => {
    res.json({
      success: true,
      message: 'Tableau de bord opérateur',
      user: req.user
    });
  }
);

// Exemple de route pour les passagers
router.get('/passager/dashboard',
  verifyJWT,
  roleRedirect(['user', 'admin', 'super_admin']),
  (req, res) => {
    res.json({
      success: true,
      message: 'Espace passager',
      user: req.user
    });
  }
);

module.exports = router;
