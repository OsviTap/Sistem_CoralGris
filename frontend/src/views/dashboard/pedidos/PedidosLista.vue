<script setup>
import { ref, onMounted } from 'vue'
import { usePedidoStore } from '@/stores/pedido'
import { useRouter } from 'vue-router'

const pedidoStore = usePedidoStore()
const router = useRouter()
const loading = ref(true)

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(price)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getEstadoClass = (estado) => {
  const classes = {
    'pendiente': 'bg-yellow-100 text-yellow-800',
    'en_proceso': 'bg-blue-100 text-blue-800',
    'completado': 'bg-green-100 text-green-800',
    'cancelado': 'bg-red-100 text-red-800'
  }
  return classes[estado] || 'bg-gray-100 text-gray-800'
}

onMounted(async () => {
  try {
    await pedidoStore.fetchPedidos()
  } catch (error) {
    console.error('Error al cargar pedidos:', error)
  } finally {
    loading.value = false
  }
})

const verDetalle = (id) => {
  router.push(`/dashboard/pedidos/${id}`)
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Pedidos</h1>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#33c7d1]"></div>
    </div>

    <!-- Tabla de pedidos -->
    <div v-else class="bg-white shadow rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Pedido
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="pedido in pedidoStore.pedidos" :key="pedido.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                #{{ pedido.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ pedido.cliente?.nombre || 'Cliente no registrado' }}</div>
                <div class="text-sm text-gray-500">{{ pedido.cliente?.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(pedido.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatPrice(pedido.total) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="getEstadoClass(pedido.estado)"
                >
                  {{ pedido.estado }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="verDetalle(pedido.id)"
                  class="text-[#33c7d1] hover:text-[#2ba3ac]"
                >
                  Ver detalle
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template> 