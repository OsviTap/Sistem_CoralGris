const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminCheck');
const upload = require('../middleware/upload');
const { productValidations } = require('../middleware/validate');

// Rutas públicas
router.get('/', productoController.getProductos);
router.get('/recomendados', productoController.getProductosRecomendados);
router.get('/:id', productoController.getProductoById);

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

router.put('/:id/estado',
  authMiddleware,
  adminMiddleware,
  productoController.updateProductoEstado
);

// Rutas para el interés en productos
router.post('/:id/interes', productoController.registrarInteres);
router.get('/sin-stock/interes', 
  authMiddleware, 
  adminMiddleware, 
  productoController.getProductosConInteres
);

module.exports = router;