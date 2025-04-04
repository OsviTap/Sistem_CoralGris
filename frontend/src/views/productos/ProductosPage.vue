<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useProductoStore } from '@/stores/producto'
import { useCategoriaStore } from '@/stores/categoria'
import { useMarcaStore } from '@/stores/marca'
import { useAuthStore } from '@/stores/auth'
import ProductCard from '@/components/productos/ProductCard.vue'
import Filtros from '@/components/productos/Filtros.vue'
import Paginacion from '@/components/common/Paginacion.vue'
import Navbar from '@/components/landing/Navbar.vue'
import Footer from '@/components/landing/Footer.vue'
import { useCartStore } from '@/stores/cart'

const productoStore = useProductoStore()
const categoriaStore = useCategoriaStore()
const marcaStore = useMarcaStore()
const authStore = useAuthStore()
const cartStore = useCartStore()

const showFilters = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const userLevel = computed(() => authStore.user?.nivel_precio || 'L1')

const cargarProductos = async () => {
  try {
    console.log('Cargando productos...')
    await productoStore.fetchProductos()
    console.log('Productos cargados:', productoStore.productos)
  } catch (error) {
    console.error('Error al cargar productos:', error)
  }
}

onMounted(async () => {
  await Promise.all([
    cargarProductos(),
    categoriaStore.fetchCategorias(),
    marcaStore.fetchMarcas()
  ])
})

const toggleFilters = () => {
  showFilters.value = !showFilters.value
  if (showFilters.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const applyFiltersAndClose = (filters) => {
  productoStore.filtros = { ...productoStore.filtros, ...filters }
  productoStore.paginacion.paginaActual = 1
  cargarProductos()
  toggleFilters()
}

// Observar cambios en los filtros
watch(
  () => productoStore.filtros,
  () => {
    productoStore.paginacion.paginaActual = 1
    cargarProductos()
  },
  { deep: true }
)

// Observar cambios en la página
watch(
  () => productoStore.paginacion.paginaActual,
  cargarProductos
)

const agregarAlCarrito = (producto) => {
  cartStore.addItem(producto)
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />

    <main class="flex-grow">
      <!-- Banner promocional -->
      <div class="bg-[#33c7d1] text-white py-3">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p class="text-center text-sm md:text-base font-medium">
            ¡Oferta especial! Descuentos de hasta el 50% en productos seleccionados
          </p>
        </div>
      </div>

      <div class="min-h-screen bg-gray-50">
        <!-- Header con título y botón de filtros -->
        <div class="bg-white shadow">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="flex justify-between items-center">
              <h1 class="text-3xl font-bold text-gray-900 font-display">Productos</h1>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex flex-col md:flex-row gap-6">
            <!-- Filtros para desktop -->
            <aside class="hidden md:block w-64 bg-white rounded-lg shadow-lg p-6">
              <Filtros @aplicar-filtros="productoStore.setFiltros" />
            </aside>

            <!-- Grid de productos -->
            <div class="flex-1">
              <!-- Botón flotante de filtros en móvil -->
              <div class="sticky top-[calc(4rem+3rem)] z-30 md:hidden mb-8">
                <button
                  @click="toggleFilters"
                  class="float-right bg-[#FF1F6D] p-3 rounded-full text-white shadow-lg hover:bg-[#e01a61] transition-colors duration-300 mr-2"
                >
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
              </div>

              <div v-if="productoStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div v-for="n in 8" :key="n" class="animate-pulse">
                  <div class="bg-gray-200 aspect-square rounded-lg"></div>
                  <div class="mt-4 space-y-3">
                    <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div class="h-4 bg-gray-200 rounded"></div>
                    <div class="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>

              <div v-else-if="productoStore.error" class="text-center py-12">
                <div class="text-red-500 font-medium">{{ productoStore.error }}</div>
                <button 
                  @click="cargarProductos"
                  class="mt-4 text-[#33c7d1] hover:text-[#2ba3ac]"
                >
                  Intentar nuevamente
                </button>
              </div>

              <div v-else-if="!productoStore.productos || productoStore.productos.length === 0" class="text-center py-12">
                <p class="text-gray-500">No se encontraron productos</p>
                <button 
                  @click="cargarProductos"
                  class="mt-4 text-[#33c7d1] hover:text-[#2ba3ac]"
                >
                  Recargar productos
                </button>
              </div>

              <transition-group 
                v-else
                name="fade" 
                tag="div" 
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                <ProductCard
                  v-for="producto in productoStore.productos"
                  :key="producto.id"
                  :producto="producto"
                  :show-precios-mayoristas="isAuthenticated"
                  :nivel-precio="userLevel"
                  @agregar-al-carrito="agregarAlCarrito"
                />
              </transition-group>

              <!-- Paginación -->
              <div class="mt-6">
                <Paginacion
                  :pagina-actual="productoStore.paginacion.paginaActual"
                  :total-paginas="productoStore.paginacion.totalPaginas"
                  @cambiar-pagina="productoStore.setPagina"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal de filtros para móvil -->
    <Transition name="slide">
      <div v-if="showFilters" class="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
        <div 
          class="fixed inset-y-0 right-0 w-80 bg-white shadow-xl transform transition-transform duration-300"
          :class="showFilters ? 'translate-x-0' : 'translate-x-full'"
        >
          <!-- Header del modal -->
          <div class="flex items-center justify-between p-4 border-b">
            <h3 class="text-lg font-medium">Filtros</h3>
            <button 
              @click="toggleFilters"
              class="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Contenido de filtros -->
          <div class="p-4 overflow-y-auto h-full pb-20">
            <Filtros @aplicar-filtros="applyFiltersAndClose" />
          </div>
        </div>
      </div>
    </Transition>

    <Footer />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-out;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}
</style>