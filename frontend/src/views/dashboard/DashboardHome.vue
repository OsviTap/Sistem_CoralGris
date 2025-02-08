<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePedidoStore } from '@/stores/pedido'

const authStore = useAuthStore()
const pedidoStore = usePedidoStore()

const stats = ref({
  pedidosHoy: 0,
  pedidosPendientes: 0,
  pedidosCompletados: 0,
  ingresosMes: 0
})

onMounted(async () => {
  // Aquí irían las llamadas a la API para obtener las estadísticas
  // Por ahora usaremos datos de ejemplo
  stats.value = {
    pedidosHoy: 5,
    pedidosPendientes: 12,
    pedidosCompletados: 45,
    ingresosMes: 15000
  }
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(value)
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900 mb-6">
      Panel de Control
    </h1>

    <!-- Estadísticas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Pedidos de hoy -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-8 w-8 text-[#33c7d1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div class="ml-4">
            <h2 class="text-sm font-medium text-gray-500">Pedidos Hoy</h2>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.pedidosHoy }}</p>
          </div>
        </div>
      </div>

      <!-- Pedidos pendientes -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <h2 class="text-sm font-medium text-gray-500">Pendientes</h2>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.pedidosPendientes }}</p>
          </div>
        </div>
      </div>

      <!-- Pedidos completados -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <h2 class="text-sm font-medium text-gray-500">Completados</h2>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.pedidosCompletados }}</p>
          </div>
        </div>
      </div>

      <!-- Ingresos del mes -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-8 w-8 text-[#33c7d1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <h2 class="text-sm font-medium text-gray-500">Ingresos del Mes</h2>
            <p class="text-2xl font-semibold text-gray-900">{{ formatCurrency(stats.ingresosMes) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido adicional -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">
        Bienvenido, {{ authStore.user?.nombre }}
      </h2>
      <p class="text-gray-600">
        Este es tu panel de control donde podrás gestionar todos los aspectos de tu negocio.
      </p>
    </div>
  </div>
</template> 