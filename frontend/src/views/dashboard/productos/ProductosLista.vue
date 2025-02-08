<script setup>
import { ref, onMounted } from 'vue'
import { useProductoStore } from '@/stores/producto'
import { useRouter } from 'vue-router'

const productoStore = useProductoStore()
const router = useRouter()
const productos = ref([])
const loading = ref(true)

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(price)
}

onMounted(async () => {
  try {
    const data = await productoStore.fetchProductos()
    productos.value = data
  } catch (error) {
    console.error('Error al cargar productos:', error)
  } finally {
    loading.value = false
  }
})

const editarProducto = (id) => {
  router.push(`/dashboard/productos/${id}/editar`)
}

const crearProducto = () => {
  router.push('/dashboard/productos/crear')
}

const eliminarProducto = async (id) => {
  if (confirm('¿Estás seguro de eliminar este producto?')) {
    try {
      await productoStore.deleteProducto(id)
      productos.value = productos.value.filter(p => p.id !== id)
    } catch (error) {
      console.error('Error al eliminar producto:', error)
    }
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Productos</h1>
      <button
        @click="crearProducto"
        class="bg-[#33c7d1] text-white px-4 py-2 rounded-lg hover:bg-[#2ba3ac] transition-colors"
      >
        Crear Producto
      </button>
    </div>

    <!-- Tabla de productos -->
    <div class="bg-white shadow-sm rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
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
            <tr v-if="loading">
              <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                Cargando productos...
              </td>
            </tr>
            <tr v-else-if="productos.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                No hay productos disponibles
              </td>
            </tr>
            <tr v-for="producto in productos" :key="producto.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 flex-shrink-0">
                    <img 
                      :src="producto.imagen_url" 
                      :alt="producto.nombre"
                      class="h-10 w-10 rounded-full object-cover"
                    >
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ producto.nombre }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ producto.codigo }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatPrice(producto.precio) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ producto.stock }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    producto.activo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ producto.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="editarProducto(producto.id)"
                  class="text-[#33c7d1] hover:text-[#2ba3ac] mr-3"
                >
                  Editar
                </button>
                <button
                  @click="eliminarProducto(producto.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template> 