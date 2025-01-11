const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

      const usuarioExiste = await Usuario.findOne({ where: { email } });
      if (usuarioExiste) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const usuario = await Usuario.create({
        nombre,
        email,
        password: hashedPassword,
        tipo_usuario,
        empresa,
        ruc,
        telefono,
        direccion,
        nivel_precio: tipo_usuario === 'cliente' ? 'L1' : null
      });

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          tipo_usuario: usuario.tipo_usuario
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ message: 'Error en el servidor' });
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