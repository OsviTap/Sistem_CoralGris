const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminCheck');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas para todos los usuarios autenticados
router.get('/profile', userController.getProfile);
router.post('/change-password', userController.changePassword);

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