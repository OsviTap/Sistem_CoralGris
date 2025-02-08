const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminCheck');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para todos los usuarios autenticados
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Rutas solo para admin
router.get('/',
  adminMiddleware,
  userController.getUsers
);

router.put('/:id',
  adminMiddleware,
  userController.updateUser
);

module.exports = router;