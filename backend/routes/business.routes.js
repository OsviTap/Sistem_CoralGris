const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');

router.post('/register-business', businessController.registerBusiness);

module.exports = router; 