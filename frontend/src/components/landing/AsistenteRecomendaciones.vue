<template>
  <div class="asistente-container">
    <!-- Mensaje de bienvenida -->
    <Transition name="slide-fade">
      <div v-if="showWelcomeMessage" class="welcome-message">
        <div class="message-content">
          <div class="message-header">
            <i class="fas fa-robot"></i>
            <h3>¡Hola! Soy tu asistente virtual</h3>
          </div>
          <p>¿Necesitas ayuda para encontrar el producto perfecto? Estoy aquí para ayudarte con recomendaciones personalizadas.</p>
          <button class="close-message" @click="closeWelcomeMessage">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Botón flotante -->
    <button 
      @click="toggleAsistente" 
      class="asistente-button"
      :class="{ 'active': isOpen }"
    >
      <i class="fas fa-robot"></i>
      <span class="button-text">Asistente Virtual</span>
    </button>

    <!-- Panel del asistente -->
    <Transition name="slide-up">
      <div v-if="isOpen" class="asistente-panel">
        <div class="panel-header">
          <h2>Asistente Virtual</h2>
          <div class="header-actions">
            <button @click="resetConversation" class="reset-button" title="Reiniciar conversación">
              <i class="fas fa-redo"></i>
            </button>
            <button @click="toggleAsistente" class="close-button">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div class="panel-content">
          <div class="chat-messages" ref="chatMessagesContainer">
            <!-- Mensaje de bienvenida -->
            <div class="message bot">
              <div class="message-content">
                <p>¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?</p>
                <div class="suggestions">
                  <button 
                    v-for="suggestion in suggestions" 
                    :key="suggestion.text"
                    @click="sendSuggestion(suggestion.text)"
                    class="suggestion-button"
                  >
                    {{ suggestion.text }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Mensajes del chat -->
            <div 
              v-for="(msg, index) in messages" 
              :key="index"
              class="message"
              :class="msg.type"
            >
              <div class="message-content">
                <p v-html="formatMessage(msg.text)"></p>
                <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
              </div>
            </div>

            <!-- Indicador de escritura -->
            <div v-if="isTyping" class="message bot typing">
              <div class="message-content">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Input para mensaje -->
          <div class="chat-input-container">
            <div class="input-wrapper">
              <input 
                v-model="userMessage"
                @keyup.enter="sendMessage"
                @keyup.esc="toggleAsistente"
                type="text"
                placeholder="Escribe tu mensaje..."
                class="chat-input"
                :disabled="isTyping"
              />
              <button 
                @click="sendMessage"
                class="send-button"
                :disabled="!userMessage.trim() || isTyping"
              >
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRecomendacionesStore } from '@/stores/recomendaciones'
import { useProductoStore } from '@/stores/producto'
import { useCarritoStore } from '@/stores/carrito'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import axios from '@/utils/axios'

const router = useRouter()
const isOpen = ref(false)
const showWelcomeMessage = ref(true)
const messages = ref([])
const userMessage = ref('')
const isTyping = ref(false)
const suggestions = ref([])
const chatMessagesContainer = ref(null)

const recomendacionesStore = useRecomendacionesStore()
const productoStore = useProductoStore()
const carritoStore = useCarritoStore()
const authStore = useAuthStore()

const categoriasEmergentes = computed(() => recomendacionesStore.categoriasEmergentes || [])

const toggleAsistente = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    closeWelcomeMessage()
    loadSuggestions()
  }
}

const closeWelcomeMessage = () => {
  showWelcomeMessage.value = false
}

const resetConversation = async () => {
  try {
    await axios.post('/chatbot/reset', {
      userId: authStore.user?.id
    })
    
    messages.value = []
    userMessage.value = ''
    
    // Agregar mensaje de bienvenida
    messages.value.push({
      type: 'bot',
      text: '¡Conversación reiniciada! ¿En qué puedo ayudarte?',
      timestamp: new Date()
    })
    
    scrollToBottom()
  } catch (error) {
    console.error('Error reiniciando conversación:', error)
  }
}

const loadSuggestions = async () => {
  try {
    const response = await axios.get('/chatbot/suggestions')
    suggestions.value = response.data.suggestions
  } catch (error) {
    console.error('Error cargando sugerencias:', error)
    // Sugerencias inteligentes por defecto (solo palabras clave)
    suggestions.value = [
      { text: 'Libros', category: 'libros' },
      { text: 'Material escolar', category: 'escolares' },
      { text: 'Papelería', category: 'papelería' },
      { text: 'Arte y manualidades', category: 'arte' },
      { text: 'Ofertas', category: 'ofertas' },
      { text: 'Horarios', category: 'horarios' }
    ]
  }
}

const sendSuggestion = (text) => {
  // Enviar solo la palabra clave, no la frase completa
  userMessage.value = text
  sendMessage()
}

const sendMessage = async () => {
  if (!userMessage.value.trim() || isTyping.value) return

  const message = userMessage.value.trim()
  
  // Agregar mensaje del usuario
  messages.value.push({
    type: 'user',
    text: message,
    timestamp: new Date()
  })

  userMessage.value = ''
  isTyping.value = true

  try {
    // Enviar mensaje al backend
    const response = await axios.post('/chatbot/process', {
      message: message,
      userId: authStore.user?.id,
      context: {
        currentPage: router.currentRoute.value.path,
        cartItems: carritoStore.items.length
      }
    })

    // Verificar que la respuesta sea válida
    const botResponse = response.data.message || 'Lo siento, no pude procesar tu mensaje. ¿Podrías intentar de nuevo?'
    
    // Agregar respuesta del bot
    messages.value.push({
      type: 'bot',
      text: botResponse,
      timestamp: new Date()
    })

    // Si la respuesta incluye productos, podríamos procesarlos aquí
    if (response.data.sentiment === 'negative') {
      // Opcional: mostrar opción de contacto humano
      setTimeout(() => {
        messages.value.push({
          type: 'bot',
          text: '¿Te gustaría hablar con un representante humano?',
          timestamp: new Date()
        })
      }, 1000)
    }

  } catch (error) {
    console.error('Error enviando mensaje:', error)
    
    messages.value.push({
      type: 'bot',
      text: 'Lo siento, hubo un error procesando tu mensaje. ¿Podrías intentar de nuevo?',
      timestamp: new Date()
    })
  } finally {
    isTyping.value = false
    await nextTick()
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  if (chatMessagesContainer.value) {
    chatMessagesContainer.value.scrollTop = chatMessagesContainer.value.scrollHeight
  }
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatMessage = (text) => {
  // Verificar que text no sea null o undefined
  if (!text) {
    return 'Lo siento, no pude procesar tu mensaje. ¿Podrías intentar de nuevo?';
  }
  
  // Convertir enlaces HTML a enlaces clickeables
  return text.replace(
    /<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g,
    '<a href="$1" target="_blank" class="text-blue-600 hover:text-blue-800 underline">$2</a>'
  )
}

// Observar cambios en los mensajes para hacer scroll
watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

onMounted(() => {
  // Inicializar mensajes como array vacío
  messages.value = []
  
  // Mostrar el mensaje de bienvenida cada vez que se carga la página
  showWelcomeMessage.value = true
})
</script>

<style scoped>
.asistente-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}

.welcome-message {
  position: fixed;
  bottom: 6rem;
  right: 2rem;
  z-index: 1000;
  animation: slideIn 0.5s ease-out;
}

.message-content {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  max-width: 300px;
  position: relative;
  border: 2px solid #33c7d1;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.message-header i {
  font-size: 1.5rem;
  color: #33c7d1;
}

.message-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.message-content p {
  color: #666;
  margin: 0;
  line-height: 1.5;
  font-size: 0.95rem;
}

.close-message {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-message:hover {
  background: #f8f9fa;
  color: #333;
  transform: rotate(90deg);
}

.asistente-button {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background-color: #33c7d1;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 50px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(51, 199, 209, 0.3);
  transition: all 0.3s ease;
  animation: bounce 2s infinite;
}

.asistente-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(51, 199, 209, 0.4);
}

.asistente-button.active {
  background-color: #2ba3ac;
  animation: none;
}

.asistente-button i {
  font-size: 1.5rem;
}

.button-text {
  font-size: 1rem;
}

.asistente-panel {
  position: fixed;
  bottom: 5rem;
  right: 2rem;
  width: 400px;
  height: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 1rem;
  background: #33c7d1;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.reset-button, .close-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.reset-button:hover, .close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 80%;
}

.message.user {
  align-self: flex-end;
}

.message.bot {
  align-self: flex-start;
}

.message-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 12px;
  position: relative;
}

.message.user .message-content {
  background: #33c7d1;
  color: white;
}

.message-content p {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.message.user .message-content p {
  color: white;
}

.message-time {
  font-size: 0.75rem;
  color: #999;
  display: block;
}

.message.user .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.suggestions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.suggestion-button {
  background: white;
  border: 2px solid #33c7d1;
  color: #33c7d1;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.9rem;
}

.suggestion-button:hover {
  background: #33c7d1;
  color: white;
  transform: translateY(-2px);
}

.chat-input-container {
  padding: 1rem;
  border-top: 1px solid #eee;
  background: white;
}

.input-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.chat-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #eee;
  border-radius: 25px;
  outline: none;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.chat-input:focus {
  border-color: #33c7d1;
}

.chat-input:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.send-button {
  background: #33c7d1;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-button:hover:not(:disabled) {
  background: #2ba3ac;
  transform: scale(1.1);
}

.send-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.typing-indicator {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #33c7d1;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@media (max-width: 768px) {
  .welcome-message {
    right: 1rem;
    bottom: 5rem;
  }

  .message-content {
    max-width: 250px;
    padding: 1.2rem;
  }

  .asistente-container {
    bottom: 1rem;
    right: 1rem;
  }

  .asistente-button {
    padding: 0.8rem 1.2rem;
  }

  .button-text {
    display: none;
  }

  .asistente-panel {
    right: 1rem;
    bottom: 4rem;
    width: calc(100% - 2rem);
    height: calc(100% - 5rem);
  }
}
</style> 