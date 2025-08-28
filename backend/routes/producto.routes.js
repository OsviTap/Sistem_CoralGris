const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminCheck');
const upload = require('../middleware/upload');
const { productValidations } = require('../middleware/validate');

// Rutas públicas - ✅ Rutas específicas primero
router.get('/', productoController.getProductos);
router.get('/recomendados', productoController.getProductosRecomendados);
router.get('/ofertas', productoController.getProductosEnOferta);

// ✅ Rutas con parámetros después
router.get('/:id', productoController.getProductoById);
router.get('/:id/recomendados', productoController.getProductosRecomendadosBasadosEnCategoria);

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
  upload.fields([
    { name: 'imagen', maxCount: 1 },
    { name: 'imagenes_adicionales', maxCount: 5 }
  ]),
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