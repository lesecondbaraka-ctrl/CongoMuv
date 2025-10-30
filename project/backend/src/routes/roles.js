const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/roles');
const roleController = require('../controllers/roleController');

// Route pour obtenir la liste des rôles accessibles à tout utilisateur authentifié
router.get('/',
  requireRole('user', 'operator', 'admin', 'superadmin', 'super_admin'),
  roleController.getAvailableRoles
);

// Route pour mettre à jour le rôle d'un utilisateur (admin ou superadmin uniquement)
router.patch('/:userId',
  requireRole('admin', 'superadmin', 'super_admin'),
  roleController.updateUserRole
);

module.exports = router;
