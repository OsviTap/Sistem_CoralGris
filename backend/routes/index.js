const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth.routes');
const productoRoutes = require('./producto.routes');
const pedidoRoutes = require('./pedido.routes');
const categoriaRoutes = require('./categoria.routes');
const contentRoutes = require('./content.routes');
const userRoutes = require('./user.routes');
const marcaRoutes = require('./marca.routes');
const consultaRoutes = require('./consulta.routes');
const recomendacionesRoutes = require('./recomendaciones');

// Configurar rutas
router.use('/auth', authRoutes);
router.use('/productos', productoRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/content', contentRoutes);
router.use('/usuarios', userRoutes);
router.use('/marcas', marcaRoutes);
router.use('/consultas', consultaRoutes);
router.use('/recomendaciones', recomendacionesRoutes);

module.exports = router;