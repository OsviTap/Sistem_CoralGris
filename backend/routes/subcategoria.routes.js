const express = require('express')
const router = express.Router()
const subcategoriaController = require('../controllers/subcategoriaController')
const authMiddleware = require('../middleware/auth')
const adminMiddleware = require('../middleware/adminCheck')

// Rutas públicas (sin autenticación)
router.get('/', subcategoriaController.getSubcategorias)
router.get('/:id', subcategoriaController.getSubcategoriaById)
router.get('/categoria/:categoriaId', subcategoriaController.getSubcategoriasByCategoria)

// Rutas protegidas (requieren autenticación y rol de administrador)
router.post('/', authMiddleware, adminMiddleware, subcategoriaController.createSubcategoria)
router.put('/:id', authMiddleware, adminMiddleware, subcategoriaController.updateSubcategoria)
router.delete('/:id', authMiddleware, adminMiddleware, subcategoriaController.deleteSubcategoria)

module.exports = router
