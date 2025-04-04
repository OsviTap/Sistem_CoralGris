<template>
  <div class="producto-detalle">
    <!-- Sección principal del producto -->
    <div class="main-section">
      <div class="container mx-auto px-4 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Galería de imágenes -->
          <div class="image-gallery">
            <div class="main-image-container">
              <img 
                :src="imagenActual" 
                :alt="producto?.nombre"
                class="w-full h-full object-cover rounded-lg shadow-lg"
              >
              <!-- Botones de navegación -->
              <div v-if="producto?.imagenes_adicionales?.length > 0" class="navigation-buttons">
                <button 
                  @click="previousImage" 
                  class="nav-button left"
                  :disabled="!hasPreviousImage"
                >
                  <i class="fas fa-chevron-left"></i>
                </button>
                <button 
                  @click="nextImage" 
                  class="nav-button right"
                  :disabled="!hasNextImage"
                >
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>

            <!-- Indicadores de imágenes -->
            <div v-if="producto?.imagenes_adicionales?.length > 0" 
              class="image-indicators mt-4"
            >
              <div class="dots-container">
                <button 
                  class="dot"
                  :class="{'active': imagenActual === producto.imagen_url}"
                  @click="selectImage(-1)"
                ></button>
                <button 
                  v-for="(imagen, index) in producto.imagenes_adicionales"
                  :key="index"
                  @click="selectImage(index)"
                  class="dot"
                  :class="{'active': imagenActual === imagen}"
                ></button>
              </div>
            </div>
          </div>

          <!-- Información del producto -->
          <div class="product-info">
            <div class="mb-6">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ producto?.nombre }}</h1>
              <div class="flex items-center gap-4">
                <span v-if="producto?.codigo_sku" class="text-sm text-gray-600">
                  SKU: {{ producto.codigo_sku }}
                </span>
                <span v-if="producto?.marca?.nombre" class="text-sm text-gray-600">
                  Marca: {{ producto.marca.nombre }}
                </span>
              </div>
            </div>

            <!-- Precios y descuentos -->
            <div class="pricing-section bg-white rounded-lg shadow-sm p-6 mb-6">
              <div class="flex items-end gap-4 mb-4">
                <div v-if="tieneDescuento" class="original-price">
                  <span class="line-through text-gray-400 text-xl">${{ formatPrice(producto?.precio_l1) }}</span>
                  <span class="discount-badge">-{{ descuentoPorcentaje }}%</span>
                </div>
                <div class="current-price">
                  <span class="text-3xl font-bold text-[#33c7d1]">${{ formatPrice(precioActual) }}</span>
                </div>
              </div>

              <!-- Precio mayoreo -->
              <div v-if="producto?.precio_l2" class="mayoreo-price mt-4 pt-4 border-t border-gray-200">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Precio mayoreo:</span>
                  <span class="text-xl font-semibold text-gray-800">${{ formatPrice(producto.precio_l2) }}</span>
                </div>
                <p class="text-sm text-gray-500 mt-1">
                  A partir de {{ producto.cantidad_mayoreo || 12 }} unidades
                </p>
              </div>
            </div>

            <!-- Descripción -->
            <div class="description-section mb-6">
              <h2 class="text-xl font-semibold mb-3">Descripción</h2>
              <p class="text-gray-600 leading-relaxed">
                {{ producto?.descripcion || 'Sin descripción disponible' }}
              </p>
            </div>

            <!-- Acciones -->
            <div class="actions-section">
              <button 
                @click="openCantidadModal"
                class="w-full mb-3 bg-[#33c7d1] text-white py-3 px-6 rounded-lg hover:bg-[#2ba3ac] transition-colors flex items-center justify-center gap-2"
                :class="{ 'opacity-50 cursor-not-allowed': producto?.agotado }"
                :disabled="producto?.agotado"
              >
                <i class="fas fa-shopping-cart"></i>
                {{ producto?.agotado ? 'Producto agotado' : 'Agregar al carrito' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección de productos recomendados -->
    <div class="recommended-section bg-gray-50 py-12">
      <div class="container mx-auto px-4">
        <h2 class="text-2xl font-bold mb-8">Productos recomendados</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <ProductoCard 
            v-for="producto in productosRecomendados" 
            :key="producto.id" 
            :producto="producto"
            class="transform hover:scale-105 transition-transform"
          />
        </div>
      </div>
    </div>

    <!-- Sección de ofertas y promociones -->
    <div class="promotions-section py-12">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold">Ofertas especiales</h2>
          <router-link 
            to="/ofertas" 
            class="text-[#33c7d1] hover:text-[#2ba3ac] flex items-center gap-2"
          >
            Ver todas
            <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>

        <!-- Carrusel de ofertas -->
        <div class="offers-carousel">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="oferta in productosEnOferta" 
              :key="oferta.id" 
              class="offer-card bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div class="relative">
                <img 
                  :src="oferta.imagen_url" 
                  :alt="oferta.nombre"
                  class="w-full h-48 object-cover"
                >
                <div class="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg">
                  -{{ oferta.descuento }}%
                </div>
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-lg mb-2">{{ oferta.nombre }}</h3>
                <div class="flex items-center justify-between">
                  <div>
                    <span class="line-through text-gray-400">${{ formatPrice(oferta.precio_original) }}</span>
                    <span class="text-xl font-bold text-red-500 ml-2">${{ formatPrice(oferta.precio_oferta) }}</span>
                  </div>
                  <button 
                    @click="verProducto(oferta)"
                    class="text-[#33c7d1] hover:text-[#2ba3ac]"
                  >
                    Ver más
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de cantidad -->
    <CantidadModal
      v-if="showCantidadModal"
      :is-open="showCantidadModal"
      :producto="producto"
      @close="showCantidadModal = false"
      @confirmar="handleAgregarAlCarrito"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductoStore } from '@/stores/producto'
import { useCartStore } from '@/stores/cart'
import ProductoCard from '@/components/productos/ProductoCard.vue'
import CantidadModal from '@/components/productos/CantidadModal.vue'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const productoStore = useProductoStore()
const cartStore = useCartStore()

const producto = ref(null)
const productosRecomendados = ref([])
const productosEnOferta = ref([])
const imagenActual = ref('')
const currentImageIndex = ref(-1)
const showCantidadModal = ref(false)

// Computed properties
const tieneDescuento = computed(() => {
  if (!producto.value) return false
  return producto.value.precio_promocion && producto.value.precio_promocion < producto.value.precio_l1
})

const descuentoPorcentaje = computed(() => {
  if (!tieneDescuento.value) return 0
  return Math.round(((producto.value.precio_l1 - producto.value.precio_promocion) / producto.value.precio_l1) * 100)
})

const precioActual = computed(() => {
  if (!producto.value) return 0
  return tieneDescuento.value ? producto.value.precio_promocion : producto.value.precio_l1
})

// Funciones de navegación de imágenes
const hasPreviousImage = computed(() => currentImageIndex.value > -1)
const hasNextImage = computed(() => {
  return currentImageIndex.value < (producto.value?.imagenes_adicionales?.length || 0) - 1
})

const selectImage = (index) => {
  currentImageIndex.value = index
  imagenActual.value = index === -1 
    ? producto.value.imagen_url 
    : producto.value.imagenes_adicionales[index]
}

const previousImage = () => {
  if (hasPreviousImage.value) {
    currentImageIndex.value--
    imagenActual.value = currentImageIndex.value === -1 
      ? producto.value.imagen_url 
      : producto.value.imagenes_adicionales[currentImageIndex.value]
  }
}

const nextImage = () => {
  if (hasNextImage.value) {
    currentImageIndex.value++
    imagenActual.value = producto.value.imagenes_adicionales[currentImageIndex.value]
  }
}

// Funciones de carrito
const handleAgregarAlCarrito = (cantidad, precio) => {
  cartStore.addItem({
    ...producto.value,
    cantidad,
    precio
  })
  showCantidadModal.value = false
  
  Swal.fire({
    title: '¡Producto agregado!',
    text: 'El producto se añadió correctamente a tu carrito',
    icon: 'success',
    showCancelButton: true,
    confirmButtonColor: '#33c7d1',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ir al carrito',
    cancelButtonText: 'Seguir comprando'
  }).then((result) => {
    if (result.isConfirmed) {
      cartStore.toggleCart()
    }
  })
}

const openCantidadModal = () => {
  if (producto.value?.agotado) {
    Swal.fire({
      title: 'Producto agotado',
      text: '¿Deseas que te notifiquemos cuando esté disponible?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#33c7d1',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, notificarme',
      cancelButtonText: 'No, gracias'
    }).then((result) => {
      if (result.isConfirmed) {
        registrarInteres()
      }
    })
  } else {
    showCantidadModal.value = true
  }
}

const registrarInteres = async () => {
  try {
    await productoStore.registrarInteresProducto(producto.value.id)
    Swal.fire({
      title: '¡Gracias por tu interés!',
      text: 'Te notificaremos cuando el producto esté disponible',
      icon: 'success',
      confirmButtonColor: '#33c7d1'
    })
  } catch (error) {
    if (error.response?.status === 429) {
      Swal.fire({
        title: 'Interés ya registrado',
        text: error.response.data.message,
        icon: 'info',
        confirmButtonColor: '#33c7d1'
      })
    } else {
      console.error('Error al registrar interés:', error)
      Swal.fire({
        title: 'Error',
        text: 'No se pudo registrar tu interés',
        icon: 'error',
        confirmButtonColor: '#d33'
      })
    }
  }
}

const verProducto = (producto) => {
  router.push(`/productos/${producto.id}`)
}

const formatPrice = (price) => {
  if (!price) return '0.00'
  return Number(price).toFixed(2)
}

// Cargar datos
onMounted(async () => {
  try {
    // Cargar producto principal
    producto.value = await productoStore.fetchProducto(route.params.id)
    imagenActual.value = producto.value.imagen_url

    // Cargar productos recomendados
    productosRecomendados.value = await productoStore.fetchProductosRecomendados(route.params.id)

    // Cargar productos en oferta
    productosEnOferta.value = await productoStore.fetchProductosEnOferta()
  } catch (error) {
    console.error('Error al cargar los datos:', error)
    Swal.fire({
      title: 'Error',
      text: 'No se pudo cargar la información del producto',
      icon: 'error',
      confirmButtonColor: '#d33'
    }).then(() => {
      router.push('/')
    })
  }
})
</script>

<style scoped>
.producto-detalle {
  min-height: 100vh;
  background-color: #ffffff;
}

.main-image-container {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.navigation-buttons {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
  pointer-events: none;
}

.nav-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: auto;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.nav-button:hover:not(:disabled) {
  background-color: white;
  transform: scale(1.1);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-indicators {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

.dots-container {
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ddd;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  background-color: #33c7d1;
  transform: scale(1.3);
}

.dot:hover:not(.active) {
  background-color: #bbb;
  transform: scale(1.2);
}

.discount-badge {
  background-color: #ff4757;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.offer-card {
  transition: transform 0.3s ease;
}

.offer-card:hover {
  transform: translateY(-4px);
}

@media (max-width: 768px) {
  .main-section {
    padding: 1rem;
  }

  .product-info {
    padding: 1rem;
  }
}
</style> 