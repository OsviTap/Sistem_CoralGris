const express = require('express')
const router = express.Router()
const recomendacionesController = require('../controllers/recomendacionesController')

// Registrar nueva interacción
router.post('/interaccion', recomendacionesController.registrarInteraccion)

// Obtener patrones de interacción
router.get('/patrones', recomendacionesController.obtenerPatrones)

// Obtener categorías emergentes
router.get('/categorias-emergentes', recomendacionesController.obtenerCategoriasEmergentes)

// Actualizar categoría emergente
router.put('/categorias-emergentes/:id', recomendacionesController.actualizarCategoriaEmergente)

module.exports = router 