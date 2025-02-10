<script setup>
import { ref, onMounted } from 'vue'
import { useProductoStore } from '@/stores/producto'
import { useRouter } from 'vue-router'
import BaseTable from '@/components/common/BaseTable.vue'
import BasePagination from '@/components/common/BasePagination.vue'
import BaseFilters from '@/components/common/BaseFilters.vue'
import PromocionModal from '@/components/productos/PromocionModal.vue'
import Swal from 'sweetalert2'

const productoStore = useProductoStore()
const router = useRouter()
const productos = ref([])
const loading = ref(true)
const paginacion = ref({
  total: 0,
  pagina: 1,
  porPagina: 10
})

const showPromocionModal = ref(false)

// Configuración de filtros
const filters = [
  {
    key: 'nombre',
    label: 'Nombre',
    type: 'text'
  },
  {
    key: 'codigo',
    label: 'Código',
    type: 'text'
  },
  {
    key: 'estado',
    label: 'Estado',
    type: 'select',
    options: [
      { value: 'activo', label: 'Con Stock' },
      { value: 'inactivo', label: 'Sin Stock' }
    ]
  }
]

const tableHeaders = [
  { key: 'producto', label: 'Producto' },
  { key: 'precios', label: 'Precios (L1/L2/L3/L4)' },
  { key: 'promocion', label: 'Promoción' },
  { key: 'stock', label: 'Stock' },
  { key: 'estado', label: 'Estado' },
  { key: 'acciones', label: 'Acciones' }
]

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(price)
}

const handlePageChange = async (page) => {
  productoStore.paginacion.pagina = page
  await productoStore.fetchProductos()
  productos.value = productoStore.productos
}

const handleFiltersChange = async (newFilters) => {
  productoStore.filtros = newFilters
  await productoStore.fetchProductos()
  productos.value = productoStore.productos
}

const editarProducto = (id) => {
  router.push(`/dashboard/productos/${id}/editar`)
}

const crearProducto = () => {
  router.push('/dashboard/productos/crear')
}

const cambiarEstadoStock = async (id) => {
  try {
    const producto = productos.value.find(p => p.id === id)
    if (!producto) {
      throw new Error('Producto no encontrado')
    }
    
    const nuevoEstado = producto.estado === 'activo' ? 'inactivo' : 'activo'
    
    const result = await Swal.fire({
      title: '¿Cambiar estado de stock?',
      text: `¿Desea marcar este producto como ${nuevoEstado === 'activo' ? 'con stock' : 'sin stock'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#33c7d1',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        console.log('Enviando actualización para producto:', id)
        const datosActualizacion = {
          estado: nuevoEstado,
          agotado: nuevoEstado === 'inactivo'
        }
        console.log('Datos de actualización:', datosActualizacion)
        
        await productoStore.updateProducto(id, datosActualizacion)
        await productoStore.fetchProductos()
        productos.value = productoStore.productos
        
        await Swal.fire({
          title: '¡Actualizado!',
          text: 'El estado del producto ha sido actualizado.',
          icon: 'success',
          confirmButtonColor: '#33c7d1'
        })
      } catch (error) {
        throw new Error(error.message || 'Error al actualizar el estado del producto')
      }
    }
  } catch (error) {
    console.error('Error completo:', error)
    await Swal.fire({
      title: 'Error',
      text: error.message || 'No se pudo actualizar el estado del producto',
      icon: 'error',
      confirmButtonColor: '#d33'
    })
  }
}

const togglePromocionModal = () => {
  showPromocionModal.value = !showPromocionModal.value
}

const handlePromocionGuardada = () => {
  showPromocionModal.value = false
  productoStore.fetchProductos()
}

onMounted(async () => {
  try {
    await productoStore.fetchProductos()
    productos.value = productoStore.productos
    // Actualizar la paginación con los datos del store
    if (productoStore.paginacion) {
      paginacion.value = productoStore.paginacion
    }
  } catch (error) {
    console.error('Error al cargar productos:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Productos</h1>
      <div class="flex space-x-4">
        <button
          @click="togglePromocionModal"
          class="bg-[#FF1F6D] text-white px-4 py-2 rounded-lg hover:bg-[#e01a61] transition-colors"
        >
          <i class="fas fa-percentage mr-2"></i>
          Gestionar Promociones
        </button>
        <button
          @click="crearProducto"
          class="bg-[#33c7d1] text-white px-4 py-2 rounded-lg hover:bg-[#2ba3ac] transition-colors"
        >
          Crear Producto
        </button>
      </div>
    </div>

    <BaseFilters
      :filters="filters"
      @change="handleFiltersChange"
    />

    <BaseTable
      :headers="tableHeaders"
      :items="productos"
      :loading="loading"
    >
      <template #empty>
        <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
          No hay productos disponibles
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
                  {{ producto.codigo }}
                </div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="grid grid-cols-2 gap-1 text-sm">
              <div>L1: {{ formatPrice(producto.precio_l1) }}</div>
              <div>L2: {{ formatPrice(producto.precio_l2) }}</div>
              <div>L3: {{ formatPrice(producto.precio_l3) }}</div>
              <div>L4: {{ formatPrice(producto.precio_l4) }}</div>
            </div>
            <div v-if="producto.promocion" class="mt-1 text-xs text-red-600">
              Descuento: {{ producto.promocion.descuento }}%
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">{{ producto.promocion ? producto.promocion.nombre : 'Sin promoción' }}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">{{ producto.stock }}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span
              :class="{
                'px-2 py-1 rounded-full text-sm font-semibold': true,
                'bg-green-100 text-green-800': producto.estado === 'activo',
                'bg-red-100 text-red-800': producto.estado === 'inactivo'
              }"
            >
              {{ producto.estado === 'activo' ? 'Con Stock' : 'Sin Stock' }}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div class="flex space-x-2">
              <button
                @click="editarProducto(producto.id)"
                class="text-blue-600 hover:text-blue-800"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                @click="cambiarEstadoStock(producto.id)"
                class="text-yellow-600 hover:text-yellow-800"
              >
                <i class="fas fa-box"></i>
              </button>
            </div>
          </td>
        </tr>
      </template>
    </BaseTable>

    <BasePagination
      :total="paginacion.total"
      :current-page="paginacion.pagina"
      :per-page="paginacion.porPagina"
      @page-change="handlePageChange"
    />

    <PromocionModal 
      :show="showPromocionModal"
      @close="togglePromocionModal"
      @promocion-guardada="handlePromocionGuardada"
    />
  </div>
</template> 