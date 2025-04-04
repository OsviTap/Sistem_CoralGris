<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import PostLoginModal from '@/components/auth/PostLoginModal.vue'
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore()
const showPostLoginModal = ref(false)
const email = ref('')
const password = ref('')
const rememberMe = ref(false)

const formData = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref(null)

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = null
    
    console.log('Intentando iniciar sesión con:', {
      email: email.value,
      password: password.value,
      remember: rememberMe.value
    })
    
    const result = await authStore.login({
      email: email.value,
      password: password.value,
      remember: rememberMe.value
    })

    console.log('Resultado del login:', result)

    if (result.success) {
      showPostLoginModal.value = true
    } else {
      error.value = result.error
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.value,
        confirmButtonColor: '#CF33D1'
      })
    }
  } catch (err) {
    console.error('Error en login:', err)
    error.value = err.response?.data?.message || 'Error al iniciar sesión'
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.value,
      confirmButtonColor: '#CF33D1'
    })
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push({ name: 'home' })
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al cerrar sesión',
      confirmButtonColor: '#CF33D1'
    })
  }
}

const irADashboard = () => {
  router.push({ name: 'Dashboard' })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Botón de regreso -->
      <div class="absolute top-4 left-4">
        <router-link to="/" class="flex items-center text-gray-600 hover:text-[#CF33D1]">
          <i class="fas fa-arrow-left mr-2"></i>
          Volver al inicio
        </router-link>
      </div>

      <!-- Estado de sesión -->
      <div v-if="authStore.isAuthenticated" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div class="flex items-center">
          <i class="fas fa-check-circle text-green-500 mr-2"></i>
          <span class="text-green-700">Sesión iniciada como: {{ authStore.user?.nombre }}</span>
        </div>
        <div class="mt-2 flex justify-between">
          <button @click="handleLogout" class="text-sm text-red-600 hover:text-red-800">
            <i class="fas fa-sign-out-alt mr-1"></i>
            Cerrar sesión
          </button>
          <button v-if="authStore.canAccessDashboard" 
                  @click="irADashboard" 
                  class="text-sm text-[#CF33D1] hover:text-[#a326a5]">
            <i class="fas fa-tachometer-alt mr-1"></i>
            Ir al Dashboard
          </button>
        </div>
      </div>

      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Iniciar Sesión
        </h2>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              v-model="email"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#CF33D1] focus:border-[#CF33D1] focus:z-10 sm:text-sm"
              placeholder="Correo electrónico"
            >
          </div>
          <div>
            <label for="password" class="sr-only">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              v-model="password"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#CF33D1] focus:border-[#CF33D1] focus:z-10 sm:text-sm"
              placeholder="Contraseña"
            >
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input id="remember-me" 
                   v-model="rememberMe" 
                   type="checkbox" 
                   class="h-4 w-4 text-[#CF33D1] focus:ring-[#CF33D1] border-gray-300 rounded">
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Recordarme
            </label>
          </div>

          <div class="text-sm">
            <router-link to="/recuperar-contrasena" class="font-medium text-[#CF33D1] hover:text-[#a326a5]">
              ¿Olvidaste tu contraseña?
            </router-link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#CF33D1] hover:bg-[#a326a5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CF33D1] disabled:opacity-50"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            </span>
            {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>
        </div>

        <div v-if="error" class="text-sm text-center text-red-600">
          {{ error }}
        </div>
      </form>
    </div>

    <!-- Modal post-login -->
    <PostLoginModal 
      v-if="showPostLoginModal" 
      @close="showPostLoginModal = false"
      @logout="handleLogout"
    />
  </div>
</template> 