const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Procesar mensaje del usuario
router.post('/process', chatbotController.processMessage);

// Obtener historial de conversación
router.get('/history/:userId', chatbotController.getConversationHistory);

// Obtener estadísticas del chatbot
router.get('/stats', chatbotController.getChatbotStats);

// Reiniciar conversación
router.post('/reset', chatbotController.resetConversation);

// Obtener sugerencias de mensajes
router.get('/suggestions', chatbotController.getSuggestions);

module.exports = router; 