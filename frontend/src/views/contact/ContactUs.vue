<script setup>
import { ref } from 'vue'
import Navbar from '@/components/landing/Navbar.vue'
import Footer from '@/components/landing/Footer.vue'
import axios from 'axios'

const formData = ref({
  nombre: '',
  email: '',
  telefono: '',
  asunto: '',
  mensaje: ''
})

const isSubmitting = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  isSubmitting.value = true
  errorMessage.value = ''
  
  try {
    // Enviar datos al backend
    await axios.post('/api/consultas', formData.value)
    
    // Mostrar mensaje de éxito
    showSuccess.value = true
    
    // Limpiar el formulario
    formData.value = {
      nombre: '',
      email: '',
      telefono: '',
      asunto: '',
      mensaje: ''
    }
  } catch (error) {
    console.error('Error al enviar el formulario:', error)
    errorMessage.value = 'Hubo un error al enviar tu consulta. Por favor, intenta nuevamente.'
  } finally {
    isSubmitting.value = false
    
    // Ocultar mensaje de éxito después de 3 segundos
    if (showSuccess.value) {
      setTimeout(() => {
        showSuccess.value = false
      }, 3000)
    }
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navbar />
    
    <main class="flex-grow  bg-gray-50 dark:bg-gray-900">
      <!-- Hero Section -->
      <div class="relative bg-white dark:bg-gray-800 py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center">
            <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span class="block">Contáctanos</span>
              <span class="block text-[#33c7d1]">Estamos aquí para ayudarte</span>
            </h1>
            <p class="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              ¿Tienes alguna pregunta o necesitas ayuda? Completa el formulario y nos pondremos en contacto contigo lo antes posible.
            </p>
          </div>
        </div>
      </div>

      <!-- Formulario de Contacto -->
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 mt-8">
        <div class="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <!-- Mensaje de éxito -->
          <div v-if="showSuccess" 
               class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4"
               role="alert">
            <p class="font-bold">¡Mensaje enviado!</p>
            <p>Nos pondremos en contacto contigo pronto.</p>
          </div>

          <!-- Mensaje de error -->
          <div v-if="errorMessage" 
               class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
               role="alert">
            <p class="font-bold">Error</p>
            <p>{{ errorMessage }}</p>
          </div>

          <form @submit.prevent="handleSubmit" class="p-8 space-y-8">
            <!-- Nombre -->
            <div>
              <label for="nombre" class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre completo
              </label>
              <input type="text"
                     id="nombre"
                     v-model="formData.nombre"
                     required
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1] dark:bg-gray-700 dark:border-gray-600 dark:text-white text-lg py-3 px-4">
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Correo electrónico
              </label>
              <input type="email"
                     id="email"
                     v-model="formData.email"
                     required
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1] dark:bg-gray-700 dark:border-gray-600 dark:text-white text-lg py-3 px-4">
            </div>

            <!-- Teléfono -->
            <div>
              <label for="telefono" class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teléfono
              </label>
              <input type="tel"
                     id="telefono"
                     v-model="formData.telefono"
                     required
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1] dark:bg-gray-700 dark:border-gray-600 dark:text-white text-lg py-3 px-4">
            </div>

            <!-- Asunto -->
            <div>
              <label for="asunto" class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Asunto
              </label>
              <input type="text"
                     id="asunto"
                     v-model="formData.asunto"
                     required
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1] dark:bg-gray-700 dark:border-gray-600 dark:text-white text-lg py-3 px-4">
            </div>

            <!-- Mensaje -->
            <div>
              <label for="mensaje" class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mensaje
              </label>
              <textarea id="mensaje"
                        v-model="formData.mensaje"
                        rows="6"
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1] dark:bg-gray-700 dark:border-gray-600 dark:text-white text-lg py-3 px-4"></textarea>
            </div>

            <!-- Botón de envío -->
            <div class="flex justify-end mt-8">
              <button type="submit"
                      :disabled="isSubmitting"
                      class="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-[#33c7d1] hover:bg-[#2ba1a9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#33c7d1] transition-colors duration-300">
                <svg v-if="isSubmitting"
                     class="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                     xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24">
                  <circle class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"></circle>
                  <path class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSubmitting ? 'Enviando...' : 'Enviar mensaje' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
/* Animaciones para el mensaje de éxito */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 