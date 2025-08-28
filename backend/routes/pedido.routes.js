const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const authMiddleware = require('../middleware/auth');
const vendedorMiddleware = require('../middleware/vendedorCheck');
const { pedidoValidations } = require('../middleware/validate');

// Ruta pública para crear pedidos (sin autenticación requerida)
router.post('/guest', pedidoValidations, pedidoController.createPedido);

// Las siguientes rutas requieren autenticación
router.use(authMiddleware);

// Crear pedido - usuario autenticado
router.post('/', pedidoValidations, pedidoController.createPedido);

// Obtener pedidos - filtrado por rol
router.get('/', pedidoController.getPedidos);

// Obtener un pedido específico
router.get('/:id', pedidoController.getPedidoById);

// Actualizar estado - solo vendedores y admin
router.put('/:id/estado',
  vendedorMiddleware,
  pedidoController.updateEstadoPedido
);

module.exports = router;