const express = require('express');
const router = express.Router();
const marcaController = require('../controllers/marcaController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminCheck');

router.get('/', marcaController.getMarcas);

// Rutas protegidas - solo admin
router.post('/', 
  authMiddleware, 
  adminMiddleware,
  marcaController.createMarca
);

router.put('/:id',
  authMiddleware,
  adminMiddleware,
  marcaController.updateMarca
);

router.delete('/:id',
  authMiddleware,
  adminMiddleware,
  marcaController.deleteMarca
);

module.exports = router; 