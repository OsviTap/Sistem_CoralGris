<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const emit = defineEmits(['close', 'logout'])
const showModal = ref(true)

const irADashboard = () => {
  showModal.value = false
  emit('close')
  router.push({ name: 'Dashboard' })
}

const irAProductos = () => {
  showModal.value = false
  emit('close')
  router.push({ name: 'Productos' })
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    emit('close')
    emit('logout')
    router.push({ name: 'home' })
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

onMounted(() => {
  // Solo mostrar el modal si el usuario es vendedor o administrador
  showModal.value = authStore.canAccessDashboard
})
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">¡Bienvenido!</h3>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <p class="text-gray-600 mb-6">
        Has iniciado sesión correctamente. ¿Qué te gustaría hacer ahora?
      </p>

      <div class="space-y-3">
        <button
          v-if="authStore.canAccessDashboard"
          @click="irADashboard"
          class="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#CF33D1] hover:bg-[#a326a5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CF33D1]"
        >
          <i class="fas fa-tachometer-alt mr-2"></i>
          Ir al Panel de Control
        </button>

        <button
          @click="irAProductos"
          class="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#CF33D1] hover:bg-[#a326a5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CF33D1]"
        >
          <i class="fas fa-shopping-bag mr-2"></i>
          Ver Productos
        </button>

        <button
          @click="handleLogout"
          class="w-full flex items-center justify-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <i class="fas fa-sign-out-alt mr-2"></i>
          Cerrar Sesión
        </button>
      </div>
    </div>
  </div>
</template> 