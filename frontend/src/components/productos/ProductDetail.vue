<template>
  <div class="product-detail">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando producto...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="cargarProducto">Reintentar</button>
    </div>

    <div v-else-if="producto" class="product-content">
      <div class="product-grid">
        <!-- Galería de imágenes -->
        <div class="product-gallery">
          <ImageGallery 
            :imagenes="producto.imagenes" 
            :alt="producto.nombre"
          />
        </div>

        <!-- Información del producto -->
        <div class="product-info">
          <div class="product-header">
            <h1>{{ producto.nombre }}</h1>
            <div class="product-meta">
              <span class="category">{{ producto.categoria?.nombre }}</span>
              <span class="brand">{{ producto.marca?.nombre }}</span>
              <span class="sku">SKU: {{ producto.sku }}</span>
            </div>
          </div>

          <div class="product-price">
            <div class="price-container">
              <span class="price" :class="{ 'has-discount': producto.descuento > 0 }">
                ${{ (producto.precio * (1 - producto.descuento / 100)).toFixed(2) }}
              </span>
              <span v-if="producto.descuento > 0" class="original-price">
                ${{ producto.precio.toFixed(2) }}
              </span>
              <span v-if="producto.descuento > 0" class="discount-badge">
                -{{ producto.descuento }}%
              </span>
            </div>
          </div>

          <div class="product-rating">
            <div class="stars">
              <i v-for="n in 5" :key="n" 
                class="fas fa-star"
                :class="{ 'filled': n <= producto.rating }"
              ></i>
            </div>
            <span class="rating-count">({{ producto.num_ratings }} reseñas)</span>
          </div>

          <div class="product-stock">
            <span :class="{ 'in-stock': producto.stock > 0, 'out-of-stock': producto.stock === 0 }">
              {{ producto.stock > 0 ? 'En stock' : 'Agotado' }}
            </span>
            <span v-if="producto.stock > 0" class="stock-count">
              {{ producto.stock }} unidades disponibles
            </span>
          </div>

          <div class="product-description">
            <h2>Descripción</h2>
            <p>{{ producto.descripcion }}</p>
          </div>

          <div class="product-specs">
            <h2>Especificaciones</h2>
            <ul>
              <li v-for="(valor, clave) in producto.especificaciones" :key="clave">
                <span class="spec-label">{{ clave }}:</span>
                <span class="spec-value">{{ valor }}</span>
              </li>
            </ul>
          </div>

          <div class="product-actions">
            <div class="quantity-selector">
              <button @click="decrementarCantidad" :disabled="cantidad <= 1">-</button>
              <input type="number" v-model="cantidad" min="1" :max="producto.stock">
              <button @click="incrementarCantidad" :disabled="cantidad >= producto.stock">+</button>
            </div>

            <button 
              class="add-to-cart"
              @click="agregarAlCarrito"
              :disabled="producto.stock === 0"
            >
              Agregar al carrito
            </button>

            <button 
              class="buy-now"
              @click="comprarAhora"
              :disabled="producto.stock === 0"
            >
              Comprar ahora
            </button>
          </div>
        </div>
      </div>

      <!-- Productos relacionados -->
      <div class="related-products">
        <h2>Productos relacionados</h2>
        <div class="products-grid">
          <ProductCard
            v-for="producto in productosRelacionados"
            :key="producto.id"
            :producto="producto"
            @click="verProducto(producto.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductoStore } from '@/stores/producto'
import { useCarritoStore } from '@/stores/carrito'
import ImageGallery from './ImageGallery.vue'
import ProductCard from './ProductCard.vue'

const route = useRoute()
const router = useRouter()
const productoStore = useProductoStore()
const carritoStore = useCarritoStore()

const loading = ref(false)
const error = ref(null)
const producto = ref(null)
const productosRelacionados = ref([])
const cantidad = ref(1)

const cargarProducto = async () => {
  try {
    loading.value = true
    error.value = null
    producto.value = await productoStore.obtenerProducto(route.params.id)
    productosRelacionados.value = await productoStore.obtenerProductosRelacionados(route.params.id)
  } catch (err) {
    error.value = 'Error al cargar el producto'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

const incrementarCantidad = () => {
  if (cantidad.value < producto.value.stock) {
    cantidad.value++
  }
}

const decrementarCantidad = () => {
  if (cantidad.value > 1) {
    cantidad.value--
  }
}

const agregarAlCarrito = () => {
  carritoStore.agregarProducto({
    ...producto.value,
    cantidad: cantidad.value
  })
}

const comprarAhora = () => {
  agregarAlCarrito()
  router.push('/checkout')
}

const verProducto = (id) => {
  router.push(`/productos/${id}`)
}

onMounted(() => {
  cargarProducto()
})
</script>

<style scoped>
.product-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
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

.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.product-header {
  margin-bottom: 1.5rem;
}

.product-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.product-meta {
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.price-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.price {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.has-discount {
  color: #e74c3c;
}

.original-price {
  text-decoration: line-through;
  color: #666;
}

.discount-badge {
  background-color: #e74c3c;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stars {
  color: #f1c40f;
}

.stars .fa-star:not(.filled) {
  color: #ddd;
}

.rating-count {
  color: #666;
}

.product-stock {
  margin-bottom: 1.5rem;
}

.in-stock {
  color: #27ae60;
  font-weight: bold;
}

.out-of-stock {
  color: #e74c3c;
  font-weight: bold;
}

.stock-count {
  margin-left: 0.5rem;
  color: #666;
}

.product-description,
.product-specs {
  margin-bottom: 2rem;
}

.product-specs ul {
  list-style: none;
  padding: 0;
}

.product-specs li {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.spec-label {
  font-weight: bold;
  min-width: 150px;
}

.product-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.quantity-selector {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.quantity-selector button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
}

.quantity-selector button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-selector input {
  width: 60px;
  text-align: center;
  border: none;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  padding: 0.5rem;
}

.add-to-cart,
.buy-now {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.add-to-cart {
  background-color: #3498db;
  color: white;
}

.buy-now {
  background-color: #2ecc71;
  color: white;
}

.add-to-cart:disabled,
.buy-now:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.related-products {
  margin-top: 3rem;
}

.related-products h2 {
  margin-bottom: 1.5rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: 1fr;
  }

  .product-actions {
    flex-direction: column;
  }

  .add-to-cart,
  .buy-now {
    width: 100%;
  }
}
</style> 