<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductoStore } from '@/stores/producto'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import ProductCard from '@/components/productos/ProductCard.vue'
import CantidadModal from '@/components/productos/CantidadModal.vue'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const productoStore = useProductoStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

const producto = ref(null)
const loading = ref(true)
const showCantidadModal = ref(false)
const productosRecomendados = ref([])
const productosEnOferta = ref([])
const imagenActual = ref('')
const currentImageIndex = ref(-1)
const mainImage = ref(null)
const isZooming = ref(false)
const activeTab = ref('descripcion')
const zoomEnabled = ref(true)
const isZoomed = ref(false)

// Computed properties para la navegación de imágenes
const allImages = computed(() => {
  if (!producto.value) return []
  return [producto.value.imagen_url, ...(producto.value.imagenes_adicionales || [])]
})

const hasPreviousImage = computed(() => currentImageIndex.value > 0)
const hasNextImage = computed(() => currentImageIndex.value < allImages.value.length - 1)

// Computed properties para precios
const precioNormal = computed(() => {
  if (!authStore.isAuthenticated) {
    return producto.value?.precio_l1
  }

  const tieneRol = authStore.user?.tipo_usuario && authStore.user.tipo_usuario !== 'cliente'
  let precioNivel = producto.value?.precio_l1

  if (tieneRol) {
    precioNivel = producto.value?.precio_l3 || producto.value?.precio_l2 || producto.value?.precio_l1
  } else {
    precioNivel = producto.value?.precio_l2 || producto.value?.precio_l1
  }
  
  return precioNivel
})

const precioMayoreo = computed(() => {
  if (!authStore.isAuthenticated) {
    return producto.value?.precio_l2
  }

  const tieneRol = authStore.user?.tipo_usuario && authStore.user.tipo_usuario !== 'cliente'
  let precioMayoreo = producto.value?.precio_l2

  if (tieneRol) {
    precioMayoreo = producto.value?.precio_l4 || producto.value?.precio_l3
  } else {
    precioMayoreo = producto.value?.precio_l2
  }
  
  return precioMayoreo
})

const mostrarPrecioTachado = computed(() => {
  if (!authStore.isAuthenticated) return false
  
  const tieneRol = authStore.user?.tipo_usuario && authStore.user.tipo_usuario !== 'cliente'
  if (!tieneRol) return false
  
  const precioL1 = producto.value?.precio_l1
  const precioActual = precioNormal.value
  
  return precioL1 && precioActual && precioL1 !== precioActual
})

const calcularDescuento = computed(() => {
  if (!mostrarPrecioTachado.value) return 0
  
  const precioL1 = producto.value?.precio_l1
  const precioActual = precioNormal.value
  
  return ((precioL1 - precioActual) / precioL1 * 100).toFixed(1)
})

// Métodos para la navegación de imágenes
const previousImage = () => {
  if (hasPreviousImage.value) {
    currentImageIndex.value--
    imagenActual.value = allImages.value[currentImageIndex.value]
  }
}

const nextImage = () => {
  if (hasNextImage.value) {
    currentImageIndex.value++
    imagenActual.value = allImages.value[currentImageIndex.value]
  }
}

const selectImage = (index) => {
  currentImageIndex.value = index
  imagenActual.value = allImages.value[index]
}

const formatPrice = (price) => {
  if (!price) return '0.00'
  return Number(price).toFixed(2)
}

const cargarProducto = async () => {
  try {
    loading.value = true
    const response = await productoStore.fetchProducto(route.params.id)
    producto.value = response
    imagenActual.value = producto.value.imagen_url
    
    // Cargar productos recomendados
    const recomendados = await productoStore.fetchProductosRecomendados(producto.value.id)
    productosRecomendados.value = recomendados

    // Cargar productos en oferta
    const ofertas = await productoStore.fetchProductosEnOferta()
    productosEnOferta.value = ofertas
  } catch (error) {
    console.error('Error al cargar el producto:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo cargar el producto'
    })
  } finally {
    loading.value = false
  }
}

const handleAgregarAlCarrito = (cantidad, precioFinal) => {
  cartStore.addItem({
    ...producto.value,
    cantidad,
    precio: precioFinal
  })

  // El modal se cierra automáticamente desde CantidadModal
  // showCantidadModal.value = false

  Swal.fire({
    icon: 'success',
    title: '¡Producto agregado!',
    text: 'El producto se añadió correctamente a tu carrito',
    showCancelButton: true,
    confirmButtonColor: '#33c7d1',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ver carrito',
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
  } else if (producto.value?.stock > 0) {
    showCantidadModal.value = true
  }
}

const registrarInteres = async () => {
  try {
    await productoStore.registrarInteresProducto(producto.value.id)
    Swal.fire({
      icon: 'success',
      title: '¡Gracias por tu interés!',
      text: 'Te notificaremos cuando el producto esté disponible'
    })
  } catch (error) {
    if (error.response?.status === 429) {
      Swal.fire({
        icon: 'info',
        title: 'Interés ya registrado',
        text: error.response.data.message
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo registrar tu interés'
      })
    }
  }
}

const verProducto = (id) => {
  router.push(`/productos/${id}`)
}

const volverAProductos = () => {
  router.push('/productos')
}

// Tabs disponibles
const tabs = [
  { id: 'descripcion', label: 'Descripción', icon: 'fas fa-align-left' },
  { id: 'caracteristicas', label: 'Características', icon: 'fas fa-list-ul' },
  { id: 'envio', label: 'Envío', icon: 'fas fa-truck' }
]

// Características destacadas del producto
const caracteristicasDestacadas = computed(() => [
  {
    titulo: 'Material',
    valor: producto.value?.material || 'No especificado',
    icon: 'fas fa-cube'
  },
  {
    titulo: 'Dimensiones',
    valor: producto.value?.dimensiones || 'No especificado',
    icon: 'fas fa-ruler-combined'
  },
  {
    titulo: 'Peso',
    valor: producto.value?.peso ? `${producto.value.peso} kg` : 'No especificado',
    icon: 'fas fa-weight'
  },
  {
    titulo: 'Garantía',
    valor: producto.value?.garantia || '12 meses',
    icon: 'fas fa-shield-alt'
  }
])

// Función para manejar el zoom
const handleZoom = (event) => {
  if (!mainImage.value) return
  
  const { left, top, width, height } = mainImage.value.getBoundingClientRect()
  const x = ((event.clientX - left) / width) * 100
  const y = ((event.clientY - top) / height) * 100
  
  mainImage.value.style.transformOrigin = `${x}% ${y}%`
  mainImage.value.style.transform = 'scale(2)'
  isZooming.value = true
}

const resetZoom = () => {
  if (!mainImage.value) return
  
  mainImage.value.style.transform = 'scale(1)'
  isZooming.value = false
}

const toggleZoom = () => {
  isZoomed.value = !isZoomed.value
  if (isZoomed.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

onMounted(() => {
  cargarProducto()
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="producto-detalle-container">
    <!-- Breadcrumb mejorado -->
    <nav class="breadcrumb-nav" aria-label="breadcrumb">
      <ol class="breadcrumb-list">
        <li class="breadcrumb-item">
          <router-link to="/" class="home-link">
            <i class="fas fa-home"></i>
            <span>Inicio</span>
          </router-link>
        </li>
        <li class="breadcrumb-item">
          <router-link to="/productos" class="products-link">
            <i class="fas fa-store"></i>
            <span>Productos</span>
          </router-link>
        </li>
        <li class="breadcrumb-item active">
          <i class="fas fa-box-open"></i>
          <span>{{ producto?.nombre }}</span>
        </li>
      </ol>
    </nav>

    <!-- Botón de navegación fácil -->
    <div class="navigation-header">
      <button class="back-to-products-button" @click="volverAProductos">
        <i class="fas fa-arrow-left"></i>
        <span>Volver a la lista de productos</span>
      </button>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando producto...</p>
    </div>

    <div class="producto-detalle-content" v-else-if="producto">
      <!-- Sección principal del producto -->
      <div class="producto-main-section">
        <!-- Galería de imágenes -->
        <div class="gallery-container">
          <!-- Imagen principal -->
          <div class="main-image-wrapper">
            <div 
              class="main-image" 
              :class="{ 'zoomed': isZoomed }"
              @click="toggleZoom"
            >
              <img 
                :src="imagenActual" 
                :alt="producto.nombre"
              >
            </div>
            
            <!-- Controles de navegación -->
            <div class="gallery-controls">
              <button 
                class="nav-button prev"
                @click.stop="previousImage"
                :disabled="!hasPreviousImage"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <button 
                class="nav-button next"
                @click.stop="nextImage"
                :disabled="!hasNextImage"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <!-- Carrusel de miniaturas -->
          <div class="thumbnails-carousel">
            <div 
              v-for="(imagen, index) in allImages" 
              :key="index"
              class="thumbnail"
              :class="{ 'active': currentImageIndex === index }"
              @click.stop="selectImage(index)"
            >
              <img 
                :src="imagen" 
                :alt="`Imagen ${index + 1}`"
              >
            </div>
          </div>
        </div>

        <!-- Información del producto -->
        <div class="producto-info">
          <!-- Badges destacados -->
          <div class="product-badges">
            <span v-if="producto.nuevo" class="badge nuevo">
              <i class="fas fa-star"></i> Nuevo
            </span>
            <span v-if="mostrarPrecioTachado" class="badge oferta">
              <i class="fas fa-tag"></i> {{ calcularDescuento }}% OFF
            </span>
            <span v-if="producto.envio_gratis" class="badge envio">
              <i class="fas fa-truck"></i> Envío Gratis
            </span>
          </div>

          <h1 class="producto-titulo">{{ producto.nombre }}</h1>
          
          <div class="producto-meta">
            <div class="sku" v-if="producto.codigo_sku">
              <span class="label">SKU:</span>
              <span class="value">{{ producto.codigo_sku }}</span>
            </div>
            <div class="categoria">
              <span class="label">Categoría:</span>
              <span class="value">{{ producto.categoria?.nombre }}</span>
            </div>
            <div class="marca">
              <span class="label">Marca:</span>
              <span class="value">{{ producto.marca?.nombre }}</span>
            </div>
          </div>

          <!-- Precios -->
          <div class="precio-section">
            <div class="precio-actual">
              <span class="precio-label">Precio:</span>
              <div class="precio-display">
                <span v-if="mostrarPrecioTachado" class="precio-original">
                  ${{ formatPrice(producto.precio_l1) }}
                </span>
                <span class="precio-final">${{ formatPrice(precioNormal) }}</span>
                <span v-if="mostrarPrecioTachado" class="descuento-tag">
                  {{ calcularDescuento }}% OFF
                </span>
              </div>
            </div>

            <div v-if="precioMayoreo" class="precio-mayoreo">
              <span class="precio-label">
                Precio Mayoreo:
                <i class="fas fa-info-circle" 
                   :title="'Precio disponible a partir de ' + (producto.cantidad_mayoreo || 12) + ' unidades'">
                </i>
              </span>
              <span class="precio-valor">${{ formatPrice(precioMayoreo) }}</span>
            </div>
          </div>

          <!-- Tabs de información -->
          <div class="producto-tabs">
            <div class="tab-headers">
              <button 
                v-for="tab in tabs" 
                :key="tab.id"
                class="tab-header"
                :class="{ active: activeTab === tab.id }"
                @click="activeTab = tab.id"
              >
                <i :class="tab.icon"></i>
                <span class="tab-label">{{ tab.label }}</span>
              </button>
            </div>

            <div class="tab-content">
              <!-- Descripción -->
              <div v-if="activeTab === 'descripcion'" class="tab-pane">
                <p class="descripcion">{{ producto.descripcion }}</p>
              </div>

              <!-- Características -->
              <div v-if="activeTab === 'caracteristicas'" class="tab-pane">
                <div class="caracteristicas-grid">
                  <div class="caracteristica-item" v-for="(caract, index) in caracteristicasDestacadas" :key="index">
                    <i :class="caract.icon"></i>
                    <div class="caracteristica-info">
                      <h4>{{ caract.titulo }}</h4>
                      <p>{{ caract.valor }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Envío -->
              <div v-if="activeTab === 'envio'" class="tab-pane">
                <div class="envio-info">
                  <div class="envio-option">
                    <i class="fas fa-truck"></i>
                    <div class="envio-details">
                      <h4>Envío Estándar</h4>
                      <p>2-3 días hábiles</p>
                    </div>
                  </div>
                  <div class="envio-option">
                    <i class="fas fa-store"></i>
                    <div class="envio-details">
                      <h4>Retiro en Tienda</h4>
                      <p>Disponible inmediatamente</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Acciones -->
          <div class="producto-acciones">
            <button 
              class="btn-agregar"
              @click="openCantidadModal"
              :disabled="producto.agotado"
            >
              <i class="fas fa-shopping-cart"></i>
              <span>{{ producto.agotado ? 'Agotado' : 'Agregar al Carrito' }}</span>
            </button>
            
            <button 
              v-if="producto.agotado"
              class="btn-notificar"
              @click="registrarInteres"
            >
              <i class="fas fa-bell"></i>
              <span>Notificar Disponibilidad</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Secciones adicionales -->
      <div class="producto-secciones-adicionales">
        <!-- Productos Recomendados -->
        <section class="seccion-recomendados" v-if="productosRecomendados.length">
          <h2 class="seccion-titulo">
            <i class="fas fa-thumbs-up"></i>
            <span>Productos Recomendados</span>
          </h2>
          <div class="productos-grid">
            <ProductCard 
              v-for="prod in productosRecomendados"
              :key="prod.id"
              :producto="prod"
              @click="verProducto(prod.id)"
            />
          </div>
        </section>

        <!-- Productos en Oferta -->
        <section class="seccion-ofertas" v-if="productosEnOferta.length">
          <h2 class="seccion-titulo">
            <i class="fas fa-fire"></i>
            <span>Ofertas Especiales</span>
          </h2>
          <div class="productos-grid">
            <ProductCard 
              v-for="prod in productosEnOferta"
              :key="prod.id"
              :producto="prod"
              @click="verProducto(prod.id)"
            />
          </div>
        </section>
      </div>
    </div>

    <!-- Modal de cantidad -->
    <Teleport to="body">
      <CantidadModal
        v-if="showCantidadModal"
        :is-open="showCantidadModal"
        :producto="producto"
        @close="showCantidadModal = false"
        @confirmar="handleAgregarAlCarrito"
      />
    </Teleport>
  </div>
</template>

<style scoped>
/* Estilos base */
.producto-detalle-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  position: relative;
  background: white;
  border-radius: 20px;
  box-shadow: 0 0 20px rgba(51, 199, 209, 0.2);
  animation: neonGlow 3s ease-in-out infinite alternate;
}

/* Breadcrumb mejorado */
.breadcrumb-nav {
  margin-bottom: 1rem;
  background: white;
  padding: 0.8rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.breadcrumb-nav::-webkit-scrollbar {
  display: none;
}

/* Navegación mejorada */
.navigation-header {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.back-to-products-button {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1.5rem;
  background-color: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 12px;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
}

.back-to-products-button:hover {
  background-color: #e9ecef;
  transform: translateX(-5px);
}

/* Contenido principal mejorado */
.producto-main-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

/* Galería mejorada */
.gallery-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.main-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.main-image {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: zoom-in;
  background-color: #f8f9fa;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.main-image:hover img {
  transform: scale(1.1);
}

.main-image.zoomed {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10000;
  border-radius: 0;
  cursor: zoom-out;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image.zoomed img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  transform: none;
}

.gallery-controls {
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

.thumbnails-carousel {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  background: rgba(248, 249, 250, 0.5);
  border-radius: 8px;
}

.thumbnails-carousel::-webkit-scrollbar {
  display: none;
}

.thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.thumbnail.active {
  border-color: #33c7d1;
  transform: scale(1.1);
}

.thumbnail:hover:not(.active) {
  transform: scale(1.1);
  border-color: rgba(51, 199, 209, 0.5);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.thumbnail:hover img {
  transform: scale(1.2);
}

/* Información del producto mejorada */
.producto-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
}

.product-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.3s ease;
}

.badge:hover {
  transform: translateY(-2px);
}

/* Precios mejorados */
.precio-section {
  background: white;
  padding: 1.2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.precio-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #33c7d1, #FF1F6D);
}

.precio-display {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem;
  margin-top: 1rem;
}

.precio-final {
  font-size: 1.8rem;
  font-weight: 700;
  color: #33c7d1;
  position: relative;
}

.precio-final::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #33c7d1, transparent);
}

/* Tabs mejorados */
.producto-tabs {
  border: 1px solid #dee2e6;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.tab-headers {
  display: flex;
  flex-wrap: wrap;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  position: relative;
}

.tab-header {
  padding: 0.8rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 120px;
  justify-content: center;
  position: relative;
}

.tab-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #33c7d1, #FF1F6D);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.tab-header.active::after {
  transform: scaleX(1);
}

/* Acciones mejoradas */
.producto-acciones {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-agregar,
.btn-notificar {
  padding: 1rem;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.btn-agregar {
  background: linear-gradient(135deg, #33c7d1, #2ba3ac);
  color: white;
  border: none;
}

.btn-agregar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2ba3ac, #33c7d1);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.btn-agregar:hover::before {
  opacity: 1;
}

/* Secciones adicionales */
.producto-secciones-adicionales {
  margin-top: 3rem;
}

.seccion-titulo {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

/* Media Queries mejorados */
@media (min-width: 640px) {
  .producto-detalle-container {
    padding: 1.5rem;
  }

  .back-to-products-button {
    width: auto;
    flex: 0 1 auto;
  }

  .tab-label {
    display: inline;
  }

  .product-badges {
    margin-bottom: 1.5rem;
  }
}

@media (min-width: 768px) {
  .producto-main-section {
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }

  .gallery-container {
    max-width: 600px;
  }

  .thumbnail {
    width: 70px;
    height: 70px;
  }

  .main-image {
    order: 2;
  }

  .producto-acciones {
    flex-direction: row;
  }

  .btn-agregar,
  .btn-notificar {
    width: auto;
    flex: 1;
  }

  .precio-section {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .producto-detalle-container {
    padding: 2rem;
  }

  .producto-titulo {
    font-size: 2.2rem;
  }

  .precio-final {
    font-size: 2.2rem;
  }

  .productos-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
  }

  .gallery-container {
    max-width: 700px;
  }

  .thumbnail {
    width: 80px;
    height: 80px;
  }
}

/* Animaciones mejoradas */
@keyframes neonGlow {
  0% {
    box-shadow: 
      0 0 10px rgba(51, 199, 209, 0.2),
      0 0 20px rgba(51, 199, 209, 0.2),
      0 0 30px rgba(51, 199, 209, 0.2),
      0 0 40px rgba(51, 199, 209, 0.2);
  }
  50% {
    box-shadow: 
      0 0 15px rgba(51, 199, 209, 0.3),
      0 0 25px rgba(51, 199, 209, 0.3),
      0 0 35px rgba(51, 199, 209, 0.3),
      0 0 45px rgba(51, 199, 209, 0.3);
  }
  100% {
    box-shadow: 
      0 0 20px rgba(255, 31, 109, 0.2),
      0 0 30px rgba(255, 31, 109, 0.2),
      0 0 40px rgba(255, 31, 109, 0.2),
      0 0 50px rgba(255, 31, 109, 0.2);
  }
}
</style> 