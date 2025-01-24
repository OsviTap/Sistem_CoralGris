const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminCheck');

// Rutas públicas
router.get('/', categoriaController.getCategorias);

// Rutas protegidas - solo admin
router.post('/',
  authMiddleware,
  adminMiddleware,
  categoriaController.createCategoria
);

router.put('/:id',
  authMiddleware,
  adminMiddleware,
  categoriaController.updateCategoria
);

module.exports = router;