<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import PostLoginModal from '@/components/auth/PostLoginModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const showPostLoginModal = ref(false)

const formData = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref(null)

const handleSubmit = async () => {
  loading.value = true
  error.value = null

  try {
    const result = await authStore.login(formData.value)
    if (result.success) {
      if (authStore.canAccessDashboard) {
        showPostLoginModal.value = true
      } else {
        router.push('/productos')
      }
    } else {
      error.value = result.error
    }
  } catch (err) {
    error.value = 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Iniciar sesión
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
              v-model="formData.email"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#33c7d1] focus:border-[#33c7d1] focus:z-10 sm:text-sm"
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
              v-model="formData.password"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#33c7d1] focus:border-[#33c7d1] focus:z-10 sm:text-sm"
              placeholder="Contraseña"
            >
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#33c7d1] hover:bg-[#2ba3ac] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#33c7d1] disabled:opacity-50"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            </span>
            {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
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
    />
  </div>
</template> 