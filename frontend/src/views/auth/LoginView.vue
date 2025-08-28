<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import PostLoginModal from '@/components/auth/PostLoginModal.vue'
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore()
const showPostLoginModal = ref(false)
const showLoginSuccess = ref(false)
const email = ref('')
const password = ref('')
const rememberMe = ref(false)

const formData = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref(null)

// ✅ Función para redirigir al usuario según su rol
const redirectUser = () => {
  console.log('🔍 Verificando redirección del usuario...')
  console.log('Estado de autenticación:', authStore.isAuthenticated)
  console.log('Usuario:', authStore.user)
  console.log('Puede acceder al dashboard:', authStore.canAccessDashboard)
  
  if (authStore.isAuthenticated) {
    console.log('✅ Usuario autenticado, redirigiendo...')
    if (authStore.canAccessDashboard) {
      console.log('🚀 Redirigiendo al Dashboard')
      router.push({ name: 'Dashboard' })
    } else {
      console.log('🏠 Redirigiendo al Home')
      router.push({ name: 'home' })
    }
  } else {
    console.log('❌ Usuario no autenticado')
  }
}

// ✅ Verificar si el usuario ya está autenticado al cargar la página
onMounted(() => {
  // Solo redirigir si ya está autenticado desde antes
  if (authStore.isAuthenticated && authStore.user) {
    redirectUser()
  }
})

// ✅ Observar cambios en el estado de autenticación
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  // No redirigir automáticamente, dejar que el usuario elija
  if (isAuthenticated && authStore.user) {
    showLoginSuccess.value = true
  }
})

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
      // ✅ Mostrar opciones en lugar de redirigir automáticamente
      showLoginSuccess.value = true
      // Limpiar el formulario
      email.value = ''
      password.value = ''
      rememberMe.value = false
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

const irATienda = () => {
  router.push({ name: 'home' })
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

      <!-- ✅ Opciones después del login exitoso -->
      <div v-if="showLoginSuccess" class="bg-white rounded-lg shadow-lg p-6 border border-green-200">
        <div class="text-center mb-6">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <i class="fas fa-check text-green-600 text-xl"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            ¡Inicio de sesión exitoso!
          </h3>
          <p class="text-sm text-gray-600">
            Bienvenido, {{ authStore.user?.nombre }}
          </p>
        </div>

        <div class="space-y-4">
          <!-- Opción para ir a la tienda -->
          <button
            @click="irATienda"
            class="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-[#CF33D1] hover:bg-[#a326a5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CF33D1] transition-colors"
          >
            <i class="fas fa-shopping-cart mr-2"></i>
            Ir a la Tienda
          </button>

          <!-- Opción para ir al dashboard (solo si tiene acceso) -->
          <button
            v-if="authStore.canAccessDashboard"
            @click="irADashboard"
            class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CF33D1] transition-colors"
          >
            <i class="fas fa-tachometer-alt mr-2"></i>
            Ir al Dashboard
          </button>

          <!-- Opción para cerrar sesión -->
          <button
            @click="handleLogout"
            class="w-full flex items-center justify-center px-4 py-3 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <i class="fas fa-sign-out-alt mr-2"></i>
            Cerrar Sesión
          </button>
        </div>
      </div>

      <!-- Formulario de login (solo mostrar si no está autenticado o no se ha hecho login exitoso) -->
      <div v-if="!authStore.isAuthenticated || !showLoginSuccess">
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
  </div>
</template> 