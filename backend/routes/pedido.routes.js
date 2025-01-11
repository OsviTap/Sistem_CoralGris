const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const authMiddleware = require('../middleware/auth');
const vendedorMiddleware = require('../middleware/vendedorCheck');
const { pedidoValidations } = require('../middleware/validate');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Crear pedido - cualquier usuario autenticado
router.post('/', authMiddleware,
  pedidoValidations,
  pedidoController.createPedido);

// Obtener pedidos - filtrado por rol
router.get('/', pedidoController.getPedidos);

// Actualizar estado - solo vendedores y admin
router.put('/:id/estado',
  vendedorMiddleware,
  pedidoController.updateEstadoPedido
);

module.exports = router;