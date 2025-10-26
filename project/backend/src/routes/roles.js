const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/roles');
const roleController = require('../controllers/roleController');

// Récupérer la liste des rôles disponibles (accessible à tous les utilisateurs authentifiés)
router.get('/', 
  requireRole('user', 'operator', 'admin', 'super_admin'),
  roleController.getAvailableRoles
);

// Mettre à jour le rôle d'un utilisateur (admin ou super_admin)
router.patch('/:userId', 
  requireRole('admin', 'super_admin'),
  roleController.updateUserRole
);

// Ajoutez ici d'autres routes de gestion des rôles si nécessaire

module.exports = router;
