const { Usuario } = require('../models');
const bcrypt = require('bcrypt');
const { generateCredentials } = require('../utils/passwordGenerator');
const emailService = require('../services/emailService');
const whatsappService = require('../services/whatsappService');
const logger = require('../config/logger');

const businessController = {
  registerBusiness: async (req, res) => {
    try {
      const {
        nombre,
        email,
        telefono,
        empresa,
        nit,
        direccion,
        tipo_negocio,
        descripcion,
        codigo_libreria
      } = req.body;

      // Verificar si el email ya existe
      const usuarioExiste = await Usuario.findOne({ where: { email } });
      if (usuarioExiste) {
        return res.status(400).json({
          message: 'El email ya está registrado'
        });
      }

      // Generar credenciales amigables
      const credentials = generateCredentials(empresa, nombre);
      const hashedPassword = await bcrypt.hash(credentials.password, 10);

      // Determinar nivel de precio basado en tipo de negocio
      let nivel_precio = 'L3'; // Por defecto L3
      if (tipo_negocio === 'libreria' && codigo_libreria) {
        nivel_precio = 'L4'; // L4 para librerías verificadas
      }

      // Crear usuario
      const usuario = await Usuario.create({
        nombre,
        email,
        username: credentials.username,
        password: hashedPassword,
        telefono,
        empresa,
        ruc: nit,
        direccion,
        tipo_usuario: 'negocio',
        nivel_precio,
        estado: 'pendiente', // Requiere aprobación
        metadata: {
          tipo_negocio,
          descripcion,
          codigo_libreria
        }
      });

      // Enviar credenciales por email
      await emailService.sendBusinessCredentials({
        email,
        nombre,
        username: credentials.username,
        password: credentials.password,
        empresa
      });

      // Enviar credenciales por WhatsApp
      await whatsappService.sendBusinessCredentials({
        telefono,
        nombre,
        username: credentials.username,
        password: credentials.password,
        empresa
      });

      // Log del registro
      logger.info(`Nuevo registro de negocio: ${empresa} (${email})`);

      res.status(201).json({
        message: 'Solicitud de registro enviada exitosamente',
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          empresa: usuario.empresa,
          estado: usuario.estado
        }
      });

    } catch (error) {
      logger.error('Error en registro de negocio:', error);
      res.status(500).json({
        message: 'Error al procesar el registro',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  regenerateCredentials: async (req, res) => {
    try {
      const { id } = req.params;
      
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Generar nuevas credenciales
      const credentials = generateCredentials(usuario.empresa, usuario.nombre);
      const hashedPassword = await bcrypt.hash(credentials.password, 10);

      // Actualizar usuario
      await usuario.update({
        username: credentials.username,
        password: hashedPassword
      });

      // Enviar nuevas credenciales
      await emailService.sendNewCredentials({
        email: usuario.email,
        nombre: usuario.nombre,
        username: credentials.username,
        password: credentials.password
      });

      await whatsappService.sendNewCredentials({
        telefono: usuario.telefono,
        nombre: usuario.nombre,
        username: credentials.username,
        password: credentials.password
      });

      res.json({
        message: 'Credenciales regeneradas y enviadas exitosamente'
      });

    } catch (error) {
      logger.error('Error regenerando credenciales:', error);
      res.status(500).json({ message: 'Error al regenerar credenciales' });
    }
  }
};

module.exports = businessController; 