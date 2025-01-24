const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminCheck');
const upload = require('../middleware/upload');

// Rutas públicas
router.get('/', productoController.getProductos);

// Rutas protegidas - solo admin
router.post('/', 
  authMiddleware, 
  adminMiddleware,
  upload.single('imagen'),
  productoController.createProducto
);

router.put('/:id',
  authMiddleware,
  adminMiddleware,
  upload.single('imagen'),
  productoController.updateProducto
);

module.exports = router;