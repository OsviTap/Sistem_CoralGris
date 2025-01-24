const express = require('express');
const router = express.Router();
const marcaController = require('../controllers/marcaController');

router.get('/', marcaController.getMarcas);
router.post('/', marcaController.createMarca);

module.exports = router; 