const aiService = require('../services/aiService');
const { InteraccionUsuario } = require('../models');
const logger = require('../config/logger');

const chatbotController = {
  // Procesar mensaje del usuario
  processMessage: async (req, res) => {
    try {
      const { message, userId, context = {} } = req.body;

      if (!message || message.trim() === '') {
        return res.status(400).json({
          error: 'El mensaje es requerido'
        });
      }

      // Procesar mensaje con IA
      const response = await aiService.processMessage(message, userId, context);

      // Registrar interacción si hay usuario
      if (userId) {
        await InteraccionUsuario.create({
          categoria: 'chatbot',
          opcion: 'mensaje',
          productos_vistos: [],
          productos_comprados: [],
          fecha: new Date()
        });
      }

      // Analizar sentimiento
      const sentiment = await aiService.analyzeSentiment(message);

      logger.info(`Chatbot - Mensaje procesado: "${message}" -> "${response}"`);

      res.json({
        message: response,
        sentiment: sentiment.sentiment,
        confidence: sentiment.confidence,
        timestamp: new Date()
      });

    } catch (error) {
      logger.error('Error procesando mensaje del chatbot:', error);
      res.status(500).json({
        error: 'Error procesando mensaje',
        details: error.message
      });
    }
  },

  // Obtener historial de conversación
  getConversationHistory: async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;

      if (!userId) {
        return res.status(400).json({
          error: 'ID de usuario requerido'
        });
      }

      // Obtener historial de interacciones del chatbot
      const history = await InteraccionUsuario.findAll({
        where: {
          categoria: 'chatbot',
          // Aquí podrías agregar un campo para el usuario si lo necesitas
        },
        order: [['fecha', 'DESC']],
        limit: parseInt(limit)
      });

      res.json({
        history: history,
        total: history.length
      });

    } catch (error) {
      logger.error('Error obteniendo historial del chatbot:', error);
      res.status(500).json({
        error: 'Error obteniendo historial',
        details: error.message
      });
    }
  },

  // Obtener estadísticas del chatbot
  getChatbotStats: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const whereClause = {
        categoria: 'chatbot'
      };

      // Filtrar por fechas si se proporcionan
      if (startDate && endDate) {
        whereClause.fecha = {
          [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      // Contar interacciones totales
      const totalInteractions = await InteraccionUsuario.count({
        where: whereClause
      });

      // Contar interacciones por día
      const dailyStats = await InteraccionUsuario.findAll({
        where: whereClause,
        attributes: [
          [require('sequelize').fn('DATE', require('sequelize').col('fecha')), 'date'],
          [require('sequelize').fn('COUNT', '*'), 'count']
        ],
        group: [require('sequelize').fn('DATE', require('sequelize').col('fecha'))],
        order: [[require('sequelize').fn('DATE', require('sequelize').col('fecha')), 'DESC']],
        limit: 30
      });

      res.json({
        totalInteractions,
        dailyStats,
        averagePerDay: totalInteractions / Math.max(dailyStats.length, 1)
      });

    } catch (error) {
      logger.error('Error obteniendo estadísticas del chatbot:', error);
      res.status(500).json({
        error: 'Error obteniendo estadísticas',
        details: error.message
      });
    }
  },

  // Reiniciar conversación
  resetConversation: async (req, res) => {
    try {
      const { userId } = req.body;

      // Aquí podrías limpiar el contexto de la conversación
      // Por ahora solo devolvemos un mensaje de confirmación
      
      logger.info(`Chatbot - Conversación reiniciada para usuario: ${userId}`);

      res.json({
        message: 'Conversación reiniciada',
        timestamp: new Date()
      });

    } catch (error) {
      logger.error('Error reiniciando conversación:', error);
      res.status(500).json({
        error: 'Error reiniciando conversación',
        details: error.message
      });
    }
  },

  // Obtener sugerencias de mensajes (MEJORADO)
  getSuggestions: async (req, res) => {
    try {
      // Usar sugerencias inteligentes del aiService
      const suggestions = aiService.generateSmartSuggestions();

      res.json({
        suggestions: suggestions
      });

    } catch (error) {
      logger.error('Error obteniendo sugerencias:', error);
      
      // Fallback a sugerencias básicas si hay error
      const fallbackSuggestions = [
        { text: 'Libros', category: 'libros' },
        { text: 'Material escolar', category: 'escolares' },
        { text: 'Ofertas', category: 'ofertas' },
        { text: 'Horarios', category: 'horarios' }
      ];
      
      res.json({
        suggestions: fallbackSuggestions
      });
    }
  }
};

module.exports = chatbotController; 