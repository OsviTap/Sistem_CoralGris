import { defineStore } from 'pinia'
import axios from '../utils/axios'

export const useChatbotStore = defineStore('chatbot', {
  state: () => ({
    messages: [],
    isTyping: false,
    suggestions: [],
    conversationId: null,
    stats: {
      totalMessages: 0,
      averageResponseTime: 0,
      userSatisfaction: 0
    },
    loading: false,
    error: null
  }),

  getters: {
    lastMessage: (state) => {
      return state.messages[state.messages.length - 1]
    },
    
    conversationLength: (state) => {
      return state.messages.length
    },
    
    hasUnreadMessages: (state) => {
      return state.messages.some(msg => !msg.read && msg.type === 'bot')
    }
  },

  actions: {
    // Enviar mensaje al chatbot
    async sendMessage(message, userId = null, context = {}) {
      this.isTyping = true
      this.error = null
      
      try {
        // Agregar mensaje del usuario
        this.messages.push({
          id: Date.now(),
          type: 'user',
          text: message,
          timestamp: new Date(),
          read: true
        })

        const response = await axios.post('/chatbot/process', {
          message,
          userId,
          context
        })

        // Agregar respuesta del bot
        this.messages.push({
          id: Date.now() + 1,
          type: 'bot',
          text: response.data.message,
          timestamp: new Date(),
          sentiment: response.data.sentiment,
          confidence: response.data.confidence,
          read: false
        })

        // Actualizar estadísticas
        this.stats.totalMessages += 2

        return response.data

      } catch (error) {
        this.error = error.message
        console.error('Error enviando mensaje:', error)
        
        // Agregar mensaje de error
        this.messages.push({
          id: Date.now() + 1,
          type: 'bot',
          text: 'Lo siento, hubo un error procesando tu mensaje. ¿Podrías intentar de nuevo?',
          timestamp: new Date(),
          isError: true,
          read: false
        })
        
        throw error
      } finally {
        this.isTyping = false
      }
    },

    // Cargar sugerencias
    async loadSuggestions() {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get('/chatbot/suggestions')
        this.suggestions = response.data.suggestions
      } catch (error) {
        this.error = error.message
        console.error('Error cargando sugerencias:', error)
        
        // Sugerencias por defecto
        this.suggestions = [
          { text: 'Buscar productos de librería' },
          { text: 'Ver ofertas disponibles' },
          { text: 'Consultar horarios' },
          { text: 'Contactar soporte' }
        ]
      } finally {
        this.loading = false
      }
    },

    // Reiniciar conversación
    async resetConversation(userId = null) {
      this.loading = true
      this.error = null
      
      try {
        await axios.post('/chatbot/reset', { userId })
        
        this.messages = []
        this.conversationId = null
        
        // Agregar mensaje de bienvenida
        this.messages.push({
          id: Date.now(),
          type: 'bot',
          text: '¡Conversación reiniciada! ¿En qué puedo ayudarte?',
          timestamp: new Date(),
          read: false
        })
        
      } catch (error) {
        this.error = error.message
        console.error('Error reiniciando conversación:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Obtener historial de conversación
    async getConversationHistory(userId, limit = 50) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get(`/chatbot/history/${userId}?limit=${limit}`)
        return response.data
      } catch (error) {
        this.error = error.message
        console.error('Error obteniendo historial:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Obtener estadísticas del chatbot
    async getChatbotStats(startDate = null, endDate = null) {
      this.loading = true
      this.error = null
      
      try {
        const params = {}
        if (startDate) params.startDate = startDate
        if (endDate) params.endDate = endDate
        
        const response = await axios.get('/chatbot/stats', { params })
        this.stats = response.data
        return response.data
      } catch (error) {
        this.error = error.message
        console.error('Error obteniendo estadísticas:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Marcar mensajes como leídos
    markMessagesAsRead() {
      this.messages.forEach(msg => {
        if (msg.type === 'bot') {
          msg.read = true
        }
      })
    },

    // Agregar mensaje manualmente (para testing)
    addMessage(text, type = 'bot') {
      this.messages.push({
        id: Date.now(),
        type,
        text,
        timestamp: new Date(),
        read: type === 'user'
      })
    },

    // Limpiar errores
    clearError() {
      this.error = null
    },

    // Reset completo del store
    reset() {
      this.messages = []
      this.isTyping = false
      this.suggestions = []
      this.conversationId = null
      this.stats = {
        totalMessages: 0,
        averageResponseTime: 0,
        userSatisfaction: 0
      }
      this.loading = false
      this.error = null
    }
  }
}) 