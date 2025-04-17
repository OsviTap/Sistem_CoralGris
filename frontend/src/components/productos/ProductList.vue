<template>
  <div class="product-list">
    <!-- Filtros -->
    <div class="filters-section">
      <div class="filters-grid">
        <!-- Categoría -->
        <div class="filter-group">
          <label for="categoria">Categoría</label>
          <select 
            id="categoria" 
            v-model="filtros.categoria"
            @change="actualizarFiltros"
          >
            <option :value="null">Todas</option>
            <option 
              v-for="categoria in categorias" 
              :key="categoria.id" 
              :value="categoria.id"
            >
              {{ categoria.nombre }}
            </option>
          </select>
        </div>

        <!-- Marca -->
        <div class="filter-group">
          <label for="marca">Marca</label>
          <select 
            id="marca" 
            v-model="filtros.marca"
            @change="actualizarFiltros"
          >
            <option :value="null">Todas</option>
            <option 
              v-for="marca in marcas" 
              :key="marca.id" 
              :value="marca.id"
            >
              {{ marca.nombre }}
            </option>
          </select>
        </div>

        <!-- Rango de precios -->
        <div class="filter-group price-range">
          <label>Rango de precios</label>
          <div class="price-inputs">
            <input 
              type="number" 
              v-model="filtros.precioMin" 
              placeholder="Mín"
              @change="actualizarFiltros"
            >
            <span>-</span>
            <input 
              type="number" 
              v-model="filtros.precioMax" 
              placeholder="Máx"
              @change="actualizarFiltros"
            >
          </div>
        </div>

        <!-- Calificación mínima -->
        <div class="filter-group">
          <label for="rating">Calificación mínima</label>
          <select 
            id="rating" 
            v-model="filtros.rating"
            @change="actualizarFiltros"
          >
            <option :value="null">Cualquiera</option>
            <option value="4">4+ estrellas</option>
            <option value="3">3+ estrellas</option>
            <option value="2">2+ estrellas</option>
          </select>
        </div>

        <!-- Stock -->
        <div class="filter-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="filtros.stock"
              @change="actualizarFiltros"
            >
            Solo con stock
          </label>
        </div>

        <!-- Ordenamiento -->
        <div class="filter-group">
          <label for="ordenarPor">Ordenar por</label>
          <select 
            id="ordenarPor" 
            v-model="filtros.ordenarPor"
            @change="actualizarFiltros"
          >
            <option value="nombre">Nombre</option>
            <option value="precio">Precio</option>
            <option value="rating">Calificación</option>
            <option value="stock">Stock</option>
          </select>
        </div>

        <!-- Orden -->
        <div class="filter-group">
          <label for="orden">Orden</label>
          <select 
            id="orden" 
            v-model="filtros.orden"
            @change="actualizarFiltros"
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
      </div>

      <!-- Búsqueda -->
      <div class="search-group">
        <input 
          type="text" 
          v-model="filtros.busqueda" 
          placeholder="Buscar productos..."
          @input="actualizarFiltros"
        >
        <button @click="resetearFiltros" class="reset-button">
          Limpiar filtros
        </button>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando productos...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="cargarProductos">Reintentar</button>
    </div>

    <!-- Lista de productos -->
    <div v-else class="products-grid">
      <ProductCard
        v-for="producto in productosPaginados"
        :key="producto.id"
        :producto="producto"
        @click="verProducto(producto.id)"
      />
    </div>

    <!-- Sin resultados -->
    <div v-if="!loading && !error && productosFiltrados.length === 0" class="no-results">
      <p>No se encontraron productos que coincidan con los filtros seleccionados.</p>
      <button @click="resetearFiltros">Ver todos los productos</button>
    </div>

    <!-- Paginación -->
    <div v-if="productosFiltrados.length > 0" class="pagination">
      <button 
        :disabled="paginaActual === 1"
        @click="paginaActual--"
      >
        Anterior
      </button>
      <span class="page-info">
        Página {{ paginaActual }} de {{ totalPaginas }}
      </span>
      <button 
        :disabled="paginaActual === totalPaginas"
        @click="paginaActual++"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductoStore } from '@/stores/producto'
import ProductCard from './ProductCard.vue'

const router = useRouter()
const productoStore = useProductoStore()

const loading = ref(false)
const error = ref(null)
const paginaActual = ref(1)
const productosPorPagina = 12

// Filtros locales
const filtros = ref({
  categoria: null,
  marca: null,
  precioMin: null,
  precioMax: null,
  stock: null,
  rating: null,
  busqueda: '',
  ordenarPor: 'nombre',
  orden: 'asc'
})

// Computed properties
const productosFiltrados = computed(() => productoStore.productosFiltrados)
const categorias = computed(() => productoStore.categorias)
const marcas = computed(() => productoStore.marcas)

const totalPaginas = computed(() => 
  Math.ceil(productosFiltrados.value.length / productosPorPagina)
)

const productosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * productosPorPagina
  const fin = inicio + productosPorPagina
  return productosFiltrados.value.slice(inicio, fin)
})

// Métodos
const cargarProductos = async () => {
  try {
    loading.value = true
    error.value = null
    await productoStore.obtenerProductos()
    await productoStore.obtenerCategorias()
    await productoStore.obtenerMarcas()
  } catch (err) {
    error.value = 'Error al cargar los productos'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

const actualizarFiltros = () => {
  productoStore.actualizarFiltros(filtros.value)
  paginaActual.value = 1 // Resetear a la primera página
}

const resetearFiltros = () => {
  filtros.value = {
    categoria: null,
    marca: null,
    precioMin: null,
    precioMax: null,
    stock: null,
    rating: null,
    busqueda: '',
    ordenarPor: 'nombre',
    orden: 'asc'
  }
  productoStore.resetearFiltros()
  paginaActual.value = 1
}

const verProducto = (id) => {
  router.push(`/productos/${id}`)
}

// Observadores
watch(() => filtros.value, () => {
  actualizarFiltros()
}, { deep: true })

// Inicialización
onMounted(() => {
  cargarProductos()
})
</script>

<style scoped>
.product-list {
  @apply w-full max-w-7xl mx-auto px-4;
}

.filters-section {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #2c3e50;
}

.filter-group select,
.filter-group input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.price-range {
  grid-column: span 2;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-inputs input {
  width: 100px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.search-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.search-group input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.reset-button {
  padding: 0.5rem 1rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.reset-button:hover {
  background-color: #c0392b;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
}

.products-grid {
  @apply grid gap-4;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

@media (max-width: 639px) {
  .product-list {
    @apply px-2;
  }
  
  .products-grid {
    @apply flex flex-wrap;
    margin: -0.25rem;
  }
}

@media (min-width: 640px) and (max-width: 1023px) {
  .products-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@screen lg {
  .product-list {
    @apply px-6;
  }
  
  .products-grid {
    @apply gap-6;
  }
}

.products-grid > * {
  width: calc(50% - 4px) !important;
  max-width: calc(50% - 4px) !important;
  flex: 0 0 calc(50% - 4px) !important;
  box-sizing: border-box !important;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination button:not(:disabled):hover {
  background-color: #f8f9fa;
}

.page-info {
  color: #666;
}

@media (max-width: 768px) {
  .product-list {
    padding: 1rem;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .price-range {
    grid-column: span 1;
  }

  .search-group {
    flex-direction: column;
  }

  .reset-button {
    width: 100%;
  }
}
</style> 
