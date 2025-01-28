<script setup>
import { ref, onMounted, computed } from 'vue'
import { useProductoStore } from '@/stores/producto'
import { useCategoriaStore } from '@/stores/categoria'
import { useMarcaStore } from '@/stores/marca'
import { useAuthStore } from '@/stores/auth'
import ProductCard from '@/components/productos/ProductCard.vue'
import Filtros from '@/components/productos/Filtros.vue'
import Paginacion from '@/components/common/Paginacion.vue'
import Navbar from '@/components/landing/Navbar.vue'
import Footer from '@/components/landing/Footer.vue'

const productoStore = useProductoStore()
const categoriaStore = useCategoriaStore()
const marcaStore = useMarcaStore()
const authStore = useAuthStore()

const showFilters = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const userLevel = computed(() => authStore.user?.nivel_precio || 'L1')

onMounted(async () => {
  await Promise.all([
    productoStore.fetchProductos(),
    categoriaStore.fetchCategorias(),
    marcaStore.fetchMarcas()
  ])
})

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Navbar -->
    <Navbar />

    <main class="flex-grow">
      <div class="min-h-screen bg-gray-50">
        <!-- Header con título y botón de filtros -->
        <div class="bg-white shadow">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex justify-between items-center">
              <h1 class="text-2xl font-bold text-gray-900">Productos</h1>
              <button
                @click="toggleFilters"
                class="md:hidden bg-white p-2 rounded-md text-gray-400 hover:text-gray-500"
              >
                <span class="sr-only">Filtros</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex flex-col md:flex-row gap-6">
            <!-- Filtros -->
            <aside 
              class="w-full md:w-64 bg-white rounded-lg shadow p-4"
              :class="{ 'hidden md:block': !showFilters }"
            >
              <Filtros @aplicar-filtros="productoStore.setFiltros" />
            </aside>

            <!-- Grid de productos -->
            <div class="flex-1">
              <div v-if="productoStore.loading" class="flex justify-center items-center h-64">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#33c7d1]"></div>
              </div>

              <div v-else-if="productoStore.productos.length === 0" class="text-center py-12">
                <p class="text-gray-500">No se encontraron productos</p>
              </div>

              <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <ProductCard
                  v-for="producto in productoStore.productos"
                  :key="producto.id"
                  :producto="producto"
                  :show-precios-mayoristas="isAuthenticated"
                  :nivel-precio="userLevel"
                />
              </div>

              <!-- Paginación -->
              <div class="mt-6">
                <Paginacion
                  :pagina-actual="productoStore.paginaActual"
                  :total-paginas="productoStore.totalPaginas"
                  @cambiar-pagina="productoStore.setPagina"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>