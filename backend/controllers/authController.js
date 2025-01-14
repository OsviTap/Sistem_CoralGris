const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const authController = {
  // Login para usuarios
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const usuario = await Usuario.findOne({ where: { email } });
      if (!usuario) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const validPassword = await bcrypt.compare(password, usuario.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const token = jwt.sign(
        { 
          id: usuario.id, 
          tipo_usuario: usuario.tipo_usuario,
          nivel_precio: usuario.nivel_precio 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ 
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          tipo_usuario: usuario.tipo_usuario,
          nivel_precio: usuario.nivel_precio
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  // Registro de usuarios
  register: async (req, res) => {
    try {
      const { 
        nombre, 
        email, 
        password, 
        tipo_usuario = 'cliente',
        empresa,
        ruc,
        telefono,
        direccion 
      } = req.body;

      console.log('Datos recibidos:', req.body); // Log para debug

      // Validar campos requeridos
      if (!nombre || !email || !password) {
        return res.status(400).json({ 
          message: 'Nombre, email y password son requeridos' 
        });
      }

      // Verificar si el email ya existe
      const usuarioExiste = await Usuario.findOne({ where: { email } });
      if (usuarioExiste) {
        return res.status(400).json({ 
          message: 'El email ya está registrado' 
        });
      }

      // Encriptar password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      const usuario = await Usuario.create({
        nombre,
        email,
        password: hashedPassword,
        tipo_usuario,
        empresa,
        ruc,
        telefono,
        direccion,
        nivel_precio: tipo_usuario === 'cliente' ? 'L1' : null,
        estado: 'activo'
      });

      // Remover password de la respuesta
      const usuarioSinPassword = {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario,
        empresa: usuario.empresa,
        ruc: usuario.ruc,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
        nivel_precio: usuario.nivel_precio,
        estado: usuario.estado
      };

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        usuario: usuarioSinPassword
      });

    } catch (error) {
      console.error('Error en registro:', error); // Log detallado del error
      logger.error(`Error en registro: ${error.message}`);
      
      // Manejo específico de errores
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          message: 'Error de validación',
          errors: error.errors.map(e => ({
            field: e.path,
            message: e.message
          }))
        });
      }

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          message: 'El email ya está registrado'
        });
      }

      res.status(500).json({ 
        message: 'Error en el servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Verificar token
  verifyToken: async (req, res) => {
    try {
      const usuario = await Usuario.findByPk(req.usuario.id);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json({
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          tipo_usuario: usuario.tipo_usuario,
          nivel_precio: usuario.nivel_precio
        }
      });
    } catch (error) {
      console.error('Error en verificación de token:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
};

module.exports = authController;