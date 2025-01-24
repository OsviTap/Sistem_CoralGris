const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    // Verificar si existe el token en los headers
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar si el usuario existe y está activo
    const usuario = await Usuario.findOne({
      where: { 
        id: decoded.id,
        estado: 'activo'
      },
      attributes: { exclude: ['password'] }
    });

    if (!usuario) {
      return res.status(401).json({ message: 'Usuario no válido o inactivo' });
    }

    // Agregar el usuario al objeto request
    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    console.error('Error en autenticación:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = authMiddleware;