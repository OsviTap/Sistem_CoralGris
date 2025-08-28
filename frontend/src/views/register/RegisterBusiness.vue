<script setup>
import { ref } from 'vue'
import Navbar from '@/components/landing/Navbar.vue'
import Footer from '@/components/landing/Footer.vue'
import axios from 'axios'

const tiposNegocio = [
  { id: 'libreria', label: 'Librería' },
  { id: 'negocio', label: 'Otro tipo de negocio' },
  { id: 'mayorista', label: 'Comprador mayorista' }
]

const formData = ref({
  nombre: '',
  email: '',
  telefono: '',
  empresa: '',
  nit: '',
  direccion: '',
  tipo_negocio: '',
  descripcion: '',
  codigo_libreria: ''
})

const isSubmitting = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  isSubmitting.value = true
  errorMessage.value = ''
  
  try {
    const response = await axios.post('/api/register-business', formData.value)
    
    // Mostrar mensaje de éxito
    showSuccess.value = true
    
    // Limpiar el formulario
    formData.value = {
      nombre: '',
      email: '',
      telefono: '',
      empresa: '',
      nit: '',
      direccion: '',
      tipo_negocio: '',
      descripcion: '',
      codigo_libreria: ''
    }
  } catch (error) {
    console.error('Error al enviar el formulario:', error)
    errorMessage.value = 'Hubo un error al procesar tu solicitud. Por favor, intenta nuevamente.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navbar />
    
    <main class="flex-grow bg-gray-50 dark:bg-gray-900">
      <!-- Hero Section -->
      <div class="relative bg-white dark:bg-gray-800 py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center">
            <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span class="block">Registra tu Negocio</span>
              <span class="block text-[#33c7d1]">Únete a nuestra red de distribuidores</span>
            </h1>
            <p class="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Accede a precios mayoristas y beneficios exclusivos para tu negocio
            </p>
          </div>
        </div>
      </div>

      <!-- Formulario de Registro -->
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div class="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <!-- Mensajes de éxito/error -->
          <div v-if="showSuccess" 
               class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4"
               role="alert">
            <p class="font-bold">¡Registro exitoso!</p>
            <p>Te enviaremos tus credenciales de acceso por correo electrónico y WhatsApp.</p>
          </div>

          <div v-if="errorMessage" 
               class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
               role="alert">
            <p class="font-bold">Error</p>
            <p>{{ errorMessage }}</p>
          </div>

          <form @submit.prevent="handleSubmit" class="p-8 space-y-6">
            <!-- Información personal -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre completo
                </label>
                <input 
                  type="text"
                  v-model="formData.nombre"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1]"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Correo electrónico
                </label>
                <input 
                  type="email"
                  v-model="formData.email"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1]"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Teléfono/WhatsApp
                </label>
                <input 
                  type="tel"
                  v-model="formData.telefono"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1]"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  NIT
                </label>
                <input 
                  type="text"
                  v-model="formData.nit"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1]"
                />
              </div>
            </div>

            <!-- Información del negocio -->
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre del negocio
                </label>
                <input 
                  type="text"
                  v-model="formData.empresa"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1]"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dirección
                </label>
                <input 
                  type="text"
                  v-model="formData.direccion"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1]"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipo de negocio
                </label>
                <select 
                  v-model="formData.tipo_negocio"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1]"
                >
                  <option value="">Seleccione una opción</option>
                  <option v-for="tipo in tiposNegocio" :key="tipo.id" :value="tipo.id">
                    {{ tipo.label }}
                  </option>
                </select>
              </div>

              <div v-if="formData.tipo_negocio === 'libreria'">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Código de librería (si aplica)
                </label>
                <input 
                  type="text"
                  v-model="formData.codigo_libreria"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1]"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descripción adicional
                </label>
                <textarea 
                  v-model="formData.descripcion"
                  rows="4"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1]"
                  placeholder="Cuéntanos más sobre tu negocio y por qué te interesa unirte a nuestra red..."
                ></textarea>
              </div>
            </div>

            <!-- Botón de envío -->
            <div class="flex justify-center">
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-6 py-3 bg-[#33c7d1] text-white font-medium rounded-md hover:bg-[#2ba3ac] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#33c7d1] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSubmitting ? 'Enviando...' : 'Enviar solicitud' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template> 