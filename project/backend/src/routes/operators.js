const express = require('express');
const router = express.Router();
const OperatorController = require('../controllers/operatorController');
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Routes publiques (pour les utilisateurs)
router.get('/', OperatorController.getAllOperators);
router.get('/:id', OperatorController.getOperatorById);
router.get('/:id/stats', OperatorController.getOperatorStats);

// Routes protégées (administrateurs seulement)
router.post('/',
  authMiddleware(['admin', 'super_admin']),
  validate('operator'),
  OperatorController.createOperator
);

router.put('/:id',
  authMiddleware(['admin', 'super_admin']),
  validate('operator'),
  OperatorController.updateOperator
);

router.delete('/:id',
  authMiddleware(['admin', 'super_admin']),
  OperatorController.deleteOperator
);

module.exports = router;
