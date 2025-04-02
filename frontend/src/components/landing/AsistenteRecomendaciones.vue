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
          <button @click="toggleAsistente" class="close-button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="panel-content">
          <div class="chat-messages" ref="chatMessages">
            <div class="message bot">
              <div class="message-content">
                <p>¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?</p>
                <div class="quick-options">
                  <button @click="handleQuickOption('categorias')">Ver categorías</button>
                  <button @click="handleQuickOption('ofertas')">Ver ofertas</button>
                  <button @click="handleQuickOption('contacto')">Contactar soporte</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRecomendacionesStore } from '@/stores/recomendaciones'
import { useProductoStore } from '@/stores/producto'
import { useCarritoStore } from '@/stores/carrito'
import { useRouter } from 'vue-router'

const router = useRouter()
const isOpen = ref(false)
const showWelcomeMessage = ref(true)
const chatMessages = ref(null)

const recomendacionesStore = useRecomendacionesStore()
const productoStore = useProductoStore()
const carritoStore = useCarritoStore()

const categoriasEmergentes = computed(() => recomendacionesStore.categoriasEmergentes || [])

const categoriasPrincipales = [
  {
    nombre: 'Regalo',
    opciones: [
      '¿Para quién es el regalo?',
      '¿Cuál es tu presupuesto?',
      '¿Es para alguna ocasión especial?'
    ]
  },
  {
    nombre: 'Oficina',
    opciones: [
      'Material básico de oficina',
      'Organización y archivo',
      'Papelería corporativa'
    ]
  },
  {
    nombre: 'Escuela',
    opciones: [
      'Útiles escolares básicos',
      'Material de arte',
      'Mochilas y estuches'
    ]
  },
  {
    nombre: 'Arte',
    opciones: [
      'Materiales de dibujo',
      'Pintura y lienzos',
      'Manualidades'
    ]
  }
]

const toggleAsistente = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    closeWelcomeMessage()
  }
}

const closeWelcomeMessage = () => {
  showWelcomeMessage.value = false
}

const handleQuickOption = (option) => {
  switch(option) {
    case 'categorias':
      router.push('/categorias')
      break
    case 'ofertas':
      router.push('/ofertas')
      break
    case 'contacto':
      router.push('/contacto')
      break
  }
  isOpen.value = false
}

onMounted(() => {
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
  width: 350px;
  height: 500px;
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

.close-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.panel-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 80%;
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

.message-content p {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.quick-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quick-options button {
  background: white;
  border: 2px solid #33c7d1;
  color: #33c7d1;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.quick-options button:hover {
  background: #33c7d1;
  color: white;
  transform: translateY(-2px);
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