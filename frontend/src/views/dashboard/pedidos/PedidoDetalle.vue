<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePedidoStore } from '@/stores/pedido'

const route = useRoute()
const router = useRouter()
const pedidoStore = usePedidoStore()
const loading = ref(true)
const pedido = ref(null)

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(price)
}

onMounted(async () => {
  try {
    pedido.value = await pedidoStore.fetchPedidoById(route.params.id)
  } catch (error) {
    console.error('Error al cargar pedido:', error)
  } finally {
    loading.value = false
  }
})

const actualizarEstado = async (nuevoEstado) => {
  try {
    await pedidoStore.updatePedido(pedido.value.id, { estado: nuevoEstado })
    pedido.value.estado = nuevoEstado
  } catch (error) {
    console.error('Error al actualizar estado:', error)
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <button
        @click="router.push('/dashboard/pedidos')"
        class="text-gray-600 hover:text-gray-900"
      >
        ← Volver a pedidos
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#33c7d1]"></div>
    </div>

    <div v-else-if="pedido" class="space-y-6">
      <!-- Encabezado -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">
              Pedido #{{ pedido.id }}
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              {{ new Date(pedido.created_at).toLocaleDateString('es-BO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) }}
            </p>
          </div>
          <div class="flex space-x-2">
            <button
              v-if="pedido.estado === 'pendiente'"
              @click="actualizarEstado('en_proceso')"
              class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Procesar
            </button>
            <button
              v-if="pedido.estado === 'en_proceso'"
              @click="actualizarEstado('completado')"
              class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Completar
            </button>
            <button
              v-if="['pendiente', 'en_proceso'].includes(pedido.estado)"
              @click="actualizarEstado('cancelado')"
              class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <!-- Información del cliente -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">
          Información del cliente
        </h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm font-medium text-gray-500">Nombre</p>
            <p class="mt-1">{{ pedido.cliente?.nombre || 'Cliente no registrado' }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Email</p>
            <p class="mt-1">{{ pedido.cliente?.email }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Teléfono</p>
            <p class="mt-1">{{ pedido.cliente?.telefono || 'No especificado' }}</p>
          </div>
        </div>
      </div>

      <!-- Productos -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">
          Productos
        </h2>
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio unitario
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="item in pedido.items" :key="item.id">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <img 
                    :src="item.producto.imagen_url" 
                    :alt="item.producto.nombre"
                    class="h-10 w-10 rounded-full object-cover"
                  >
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ item.producto.nombre }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ item.producto.codigo }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.cantidad }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatPrice(item.precio_unitario) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatPrice(item.cantidad * item.precio_unitario) }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="px-6 py-4 text-right text-sm font-medium text-gray-900">
                Total
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {{ formatPrice(pedido.total) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <div v-else class="text-center text-gray-500">
      Pedido no encontrado
    </div>
  </div>
</template> 