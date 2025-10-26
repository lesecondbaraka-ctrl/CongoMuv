const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const homeController = require('../controllers/homeController');

// Page d'accueil principale
router.get('/', homeController.getHomePage);

// Route de déconnexion
router.get('/logout', (req, res) => {
  // Supprimer le cookie d'authentification si vous en utilisez
  res.clearCookie('token');
  
  // Rediriger vers la page d'accueil
  res.redirect('/');
});

// Autres routes publiques
router.get('/about', (req, res) => {
  res.render('about', { 
    title: 'À propos de CongoMuv',
    isAuthenticated: !!req.user
  });
});

router.get('/contact', (req, res) => {
  res.render('contact', { 
    title: 'Contactez-nous',
    isAuthenticated: !!req.user
  });
});

module.exports = router;
