const express = require('express')
const router = express.Router()
const productoController = require('../controllers/productoController')
const validacionProducto = require('../middleware/validacionProducto')
const multer = require('multer')
const upload = multer({ dest: 'uploads/productos/' })

// Rutas públicas
router.get('/', productoController.obtenerProductos)
router.get('/tendencias', productoController.obtenerTendencias)
router.get('/:id', productoController.obtenerProducto)
router.get('/:id/relacionados', productoController.obtenerProductosRelacionados)

// Rutas protegidas (requieren autenticación)
router.post('/', validacionProducto, productoController.crearProducto)
router.put('/:id', validacionProducto, productoController.actualizarProducto)
router.delete('/:id', productoController.eliminarProducto)
router.post('/imagenes', upload.array('imagenes', 5), productoController.subirImagenes)

module.exports = router 