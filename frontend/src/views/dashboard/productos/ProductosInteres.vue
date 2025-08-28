<script setup>
import { ref, onMounted } from 'vue'
import { useProductoStore } from '@/stores/producto'
import BaseTable from '@/components/common/BaseTable.vue'

const productoStore = useProductoStore()
const productos = ref([])
const loading = ref(true)

const tableHeaders = [
  { key: 'nombre', label: 'Producto' },
  { key: 'categoria', label: 'Categoría' },
  { key: 'marca', label: 'Marca' },
  { key: 'interes', label: 'Interés' },
  { key: 'estado', label: 'Estado' },
  { key: 'actions', label: 'Acciones' }
]

// Nueva función en el store
const fetchProductosInteres = async () => {
  try {
    const response = await productoStore.fetchProductosConInteres()
    productos.value = response
  } catch (error) {
    console.error('Error al cargar productos con interés:', error)
  } finally {
    loading.value = false
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(price)
}

onMounted(fetchProductosInteres)
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Productos sin Stock</h1>
      <p class="text-gray-600">Monitoreo de interés en productos sin stock</p>
    </div>

    <BaseTable
      :headers="tableHeaders"
      :items="productos"
      :loading="loading"
    >
      <template #empty>
        <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
          No hay productos sin stock con interés registrado
        </td>
      </template>

      <template #default>
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
                  {{ producto.codigo_sku }}
                </div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ producto.categoria?.nombre }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ producto.marca?.nombre }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-lg font-semibold text-blue-600">
              {{ producto.interes_count }}
            </div>
            <div class="text-xs text-gray-500">personas interesadas</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-semibold">
              Sin Stock
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button
              @click="$router.push(`/dashboard/productos/${producto.id}/editar`)"
              class="text-blue-600 hover:text-blue-800"
            >
              <i class="fas fa-edit"></i> Editar
            </button>
          </td>
        </tr>
      </template>
    </BaseTable>
  </div>
</template> 