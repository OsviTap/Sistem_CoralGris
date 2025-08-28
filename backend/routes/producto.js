const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { verifyToken } = require('../middleware/auth');

// Rutas públicas
router.get('/', productoController.getProductos);
router.get('/:id', productoController.getProductoById);
router.get('/:id/recomendados', productoController.getProductosRecomendadosBasadosEnCategoria);
router.get('/ofertas', productoController.getProductosEnOferta);

// Rutas protegidas
router.post('/', verifyToken, productoController.createProducto);
router.put('/:id', verifyToken, productoController.updateProducto);
router.delete('/:id', verifyToken, productoController.eliminarProducto);
router.post('/:id/interes', productoController.registrarInteres);

module.exports = router; 