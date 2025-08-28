const { Consulta } = require('../models');
const logger = require('../config/logger');

const consultaController = {
  // Crear nueva consulta
  create: async (req, res) => {
    try {
      const { nombre, email, telefono, asunto, mensaje } = req.body;

      const consulta = await Consulta.create({
        nombre,
        email,
        telefono,
        asunto,
        mensaje
      });

      logger.info(`Nueva consulta creada #${consulta.id}`);

      res.status(201).json({
        message: 'Consulta enviada exitosamente',
        consulta
      });

    } catch (error) {
      logger.error('Error creando consulta:', error);
      res.status(500).json({ message: 'Error al crear la consulta' });
    }
  },

  // Obtener todas las consultas
  getAll: async (req, res) => {
    try {
      const consultas = await Consulta.findAll({
        order: [['createdAt', 'DESC']]
      });

      res.json(consultas);
    } catch (error) {
      logger.error('Error obteniendo consultas:', error);
      res.status(500).json({ message: 'Error al obtener las consultas' });
    }
  },

  // Actualizar estado de consulta
  updateEstado: async (req, res) => {
    try {
      const { id } = req.params;
      
      const consulta = await Consulta.findByPk(id);
      if (!consulta) {
        return res.status(404).json({ message: 'Consulta no encontrada' });
      }

      consulta.estado = 'atendida';
      await consulta.save();

      res.json({
        message: 'Estado actualizado exitosamente',
        consulta
      });
    } catch (error) {
      logger.error('Error actualizando estado de consulta:', error);
      res.status(500).json({ message: 'Error al actualizar el estado' });
    }
  }
};

module.exports = consultaController; 