const express = require('express');
const router = express.Router();
const consultaController = require('../controllers/consultaController');
const auth = require('../middleware/auth');

// Ruta pública para crear consultas
router.post('/', consultaController.create);

// Rutas protegidas para administración
router.get('/', auth, consultaController.getAll);
router.patch('/:id/atender', auth, consultaController.updateEstado);

module.exports = router; 