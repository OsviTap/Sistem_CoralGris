<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const emit = defineEmits(['close'])
const showModal = ref(true)

const irADashboard = () => {
  showModal.value = false
  emit('close')
  router.push('/dashboard')
}

const irAProductos = () => {
  showModal.value = false
  emit('close')
  router.push('/productos')
}

const cerrarModal = () => {
  showModal.value = false
  emit('close')
}

onMounted(() => {
  // Solo mostrar el modal si el usuario es vendedor o administrador
  showModal.value = authStore.canAccessDashboard
})
</script>

<template>
  <Transition
    enter-active-class="ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <!-- Overlay de fondo -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#33c7d1] bg-opacity-20 sm:mx-0 sm:h-10 sm:w-10">
                  <svg class="h-6 w-6 text-[#33c7d1]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75m0-3H21" />
                  </svg>
                </div>
                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                    Bienvenido, {{ authStore.user?.nombre }}
                  </h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      ¿Deseas ir al panel de control o ver los productos?
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                @click="irADashboard"
                class="inline-flex w-full justify-center rounded-md bg-[#33c7d1] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2ba3ac] sm:ml-3 sm:w-auto"
              >
                Ir al Panel de Control
              </button>
              <button
                type="button"
                @click="irAProductos"
                class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Ver Productos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template> 