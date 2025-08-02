<template>
  <div>
    <Transition name="fade">
      <div v-if="isOpen" class="quick-view-overlay" @click.self="close">
        <div class="quick-view-content" @click.stop>
          <button class="close-button" @click="close">&times;</button>
          
          <div class="quick-view-grid">
            <!-- Galería de imágenes -->
            <div class="image-gallery">
              <div 
                class="main-image" 
                :class="{ 'zoomed': isZoomed }"
                @click="toggleZoom"
              >
                <img 
                  :src="imagenActual" 
                  :alt="producto.nombre"
                  class="w-full h-full object-cover"
                >
                <!-- Botones de navegación -->
                <div v-if="producto.imagenes_adicionales?.length > 0 && !isZoomed" class="navigation-buttons">
                  <button 
                    @click.stop="previousImage" 
                    class="nav-button left"
                    :disabled="!hasPreviousImage"
                  >
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <button 
                    @click.stop="nextImage" 
                    class="nav-button right"
                    :disabled="!hasNextImage"
                  >
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>

                <div v-if="producto.agotado" class="out-of-stock-badge">
                  <i class="fas fa-exclamation-circle"></i>
                  Agotado
                </div>
                <div v-else class="stock-badge">
                  <i class="fas fa-check-circle"></i>
                  Disponible
                </div>
              </div>

              <!-- Miniaturas -->
              <div v-if="producto.imagenes_adicionales?.length > 0" class="mini-thumbnails">
                <button 
                  class="mini-thumb"
                  :class="{'active': imagenActual === producto.imagen_url}"
                  @click="selectImage(-1)"
                >
                  <img 
                    :src="producto.imagen_url" 
                    alt="Imagen principal"
                    class="thumb-preview"
                  >
                </button>
                <button 
                  v-for="(imagen, index) in producto.imagenes_adicionales"
                  :key="index"
                  @click="selectImage(index)"
                  class="mini-thumb"
                  :class="{'active': imagenActual === imagen}"
                >
                  <img 
                    :src="imagen" 
                    :alt="`Imagen adicional ${index + 1}`"
                    class="thumb-preview"
                  >
                </button>
              </div>
            </div>

            <!-- Información del producto -->
            <div class="product-info">
              <div class="product-header">
                <h2>{{ producto.nombre }}</h2>
                <div class="sku" v-if="producto.codigo_sku">
                  SKU: {{ producto.codigo_sku }}
                </div>
              </div>
              
              <div class="price-section">
                <div class="current-price">
                  <span class="price-label">Precio actual:</span>
                  <span class="price" v-if="mostrarPrecioTachado">
                    <span class="price-tachado">${{ formatPrice(producto.precio_l1) }}</span>
                    <span class="price-actual">${{ formatPrice(precioNormal) }}</span>
                    <span class="descuento-badge">{{ calcularDescuento }}% desc.</span>
                  </span>
                  <span class="price" v-else>
                    ${{ formatPrice(precioNormal) }}
                  </span>
                </div>
                <div v-if="precioMayoreo" class="mayoreo-price">
                  <span class="price-label">Precio mayoreo:</span>
                  <span class="price">
                    ${{ formatPrice(precioMayoreo) }}
                  </span>
                  <span class="mayoreo-note">
                    (A partir de {{ producto.cantidad_mayoreo || 12 }} unidades)
                  </span>
                </div>
                <div v-if="explicacionPrecioTachado" class="precio-explicacion">
                  {{ explicacionPrecioTachado }}
                </div>
              </div>

              <div class="description">
                <h3>Descripción</h3>
                <p>{{ producto.descripcion || 'Sin descripción disponible' }}</p>
              </div>

              <div class="product-meta">
                <div class="meta-item" v-if="producto.categoria?.nombre">
                  <i class="fas fa-tag"></i>
                  <span><strong>Categoría:</strong> {{ producto.categoria.nombre }}</span>
                </div>
                <div class="meta-item" v-if="producto.marca?.nombre">
                  <i class="fas fa-trademark"></i>
                  <span><strong>Marca:</strong> {{ producto.marca.nombre }}</span>
                </div>
              </div>

              <div class="actions">
                <button 
                  class="add-to-cart"
                  @click="openCantidadModal"
                  :class="{ 'out-of-stock': producto.agotado }"
                  :disabled="producto.agotado"
                >
                  <i :class="producto.agotado ? 'fas fa-bell' : 'fas fa-shopping-cart'"></i>
                  {{ producto.agotado ? 'Notificar interés' : 'Agregar al carrito' }}
                </button>
                <button 
                  class="view-cart"
                  :disabled="!tieneProductosEnCarrito"
                  @click="verCarrito"
                >
                  <i class="fas fa-shopping-basket"></i>
                  Ver carrito
                </button>
                <button 
                  class="view-details"
                  @click="verDetalles"
                >
                  <i class="fas fa-search-plus"></i>
                  Ver más detalles
                </button>
              </div>

              <div v-if="producto.agotado" class="notify-interest">
                <button @click="registrarInteres" class="notify-button">
                  <i class="fas fa-bell"></i>
                  Notificar cuando esté disponible
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal de cantidad -->
    <Teleport to="body">
      <CantidadModal
        v-if="showCantidadModal"
        :is-open="showCantidadModal"
        :producto="producto"
        @close="closeCantidadModal"
        @confirmar="handleAgregarAlCarrito"
      />
    </Teleport>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useProductoStore } from '@/stores/producto'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'
import CantidadModal from './CantidadModal.vue'

export default {
  name: 'QuickViewModal',
  
  components: {
    CantidadModal
  },

  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    producto: {
      type: Object,
      required: true
    }
  },

  emits: ['close'],

  setup(props, { emit }) {
    const router = useRouter()
    const cartStore = useCartStore()
    const productoStore = useProductoStore()
    const authStore = useAuthStore()
    const showCantidadModal = ref(false)
    const imagenActual = ref(props.producto.imagen_url)
    const currentImageIndex = ref(-1)
    const useDots = ref(false) // Cambiado a false para usar miniaturas por defecto
    const isZoomed = ref(false)

    // Inicializar la imagen actual y el índice
    onMounted(() => {
      imagenActual.value = props.producto.imagen_url
      currentImageIndex.value = -1
    })

    // Función para obtener todas las imágenes (principal + adicionales)
    const allImages = computed(() => {
      return [props.producto.imagen_url, ...(props.producto.imagenes_adicionales || [])]
    })

    // Computed properties para la navegación
    const hasPreviousImage = computed(() => currentImageIndex.value > -1)
    const hasNextImage = computed(() => {
      return currentImageIndex.value < (props.producto.imagenes_adicionales?.length || 0) - 1
    })

    // Funciones de navegación
    const previousImage = () => {
      if (hasPreviousImage.value) {
        currentImageIndex.value--
        imagenActual.value = currentImageIndex.value === -1 
          ? props.producto.imagen_url 
          : props.producto.imagenes_adicionales[currentImageIndex.value]
      }
    }

    const nextImage = () => {
      if (hasNextImage.value) {
        currentImageIndex.value++
        imagenActual.value = props.producto.imagenes_adicionales[currentImageIndex.value]
      }
    }

    // Función para manejar el zoom
    const toggleZoom = () => {
      isZoomed.value = !isZoomed.value
      if (isZoomed.value) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }

    // Limpiar el estado de zoom al cerrar el modal
    const close = () => {
      isZoomed.value = false
      showCantidadModal.value = false // Cerrar también el modal de cantidad si está abierto
      document.body.style.overflow = ''
      emit('close')
    }

    const closeCantidadModal = () => {
      showCantidadModal.value = false
      // No cambiar el overflow aquí, mantener el estado del modal principal
    }

    const formatPrice = (price) => {
      if (!price) return '0.00'
      return Number(price).toFixed(2)
    }

    // Computed properties para precios
    const precioNormal = computed(() => {
      if (!authStore.isAuthenticated) {
        return props.producto.precio_l1
      }

      const tieneRol = authStore.user?.tipo_usuario && authStore.user.tipo_usuario !== 'cliente'
      let precioNivel = props.producto.precio_l1

      // Determinar el precio según si tiene rol o no
      if (tieneRol) {
        // Usuarios con rol ven precios L3 por defecto
        precioNivel = props.producto.precio_l3 || props.producto.precio_l2 || props.producto.precio_l1
      } else {
        // Usuarios sin rol ven precios L1 y L2
        precioNivel = props.producto.precio_l2 || props.producto.precio_l1
      }
      
      return precioNivel
    })

    const precioMayoreo = computed(() => {
      if (!authStore.isAuthenticated) {
        return props.producto.precio_l2
      }

      const tieneRol = authStore.user?.tipo_usuario && authStore.user.tipo_usuario !== 'cliente'
      let precioMayoreo = props.producto.precio_l2

      // Determinar el precio de mayoreo según si tiene rol o no
      if (tieneRol) {
        // Usuarios con rol ven precios L4 para mayoreo
        precioMayoreo = props.producto.precio_l4 || props.producto.precio_l3
      } else {
        // Usuarios sin rol ven precios L2 para mayoreo
        precioMayoreo = props.producto.precio_l2
      }
      
      return precioMayoreo
    })

    const mostrarPrecioTachado = computed(() => {
      if (!authStore.isAuthenticated) return false
      
      const tieneRol = authStore.user?.tipo_usuario && authStore.user.tipo_usuario !== 'cliente'
      if (!tieneRol) return false
      
      const precioL1 = props.producto.precio_l1
      const precioActual = precioNormal.value
      
      return precioL1 && precioActual && precioL1 !== precioActual
    })

    const calcularDescuento = computed(() => {
      if (!mostrarPrecioTachado.value) return 0
      
      const precioL1 = props.producto.precio_l1
      const precioActual = precioNormal.value
      
      return ((precioL1 - precioActual) / precioL1 * 100).toFixed(1)
    })

    const explicacionPrecioTachado = computed(() => {
      if (!authStore.isAuthenticated) return ''
      
      const tieneRol = authStore.user?.tipo_usuario && authStore.user.tipo_usuario !== 'cliente'
      if (!tieneRol) return ''
      
      const precioL1 = props.producto.precio_l1
      const precioActual = precioNormal.value
      
      if (!precioL1 || !precioActual || precioL1 === precioActual) return ''
      
      const descuento = ((precioL1 - precioActual) / precioL1 * 100).toFixed(1)
      return `Precio regular: $${formatPrice(precioL1)} (${descuento}% de descuento para tu nivel)`
    })

    const handleAgregarAlCarrito = (cantidadSeleccionada, precioFinal) => {
      if (props.producto.agotado) {
        registrarInteres()
      } else {
        cartStore.addItem({
          ...props.producto,
          cantidad: cantidadSeleccionada,
          precio: precioFinal
        })

        showCantidadModal.value = false
        close()

        // Mostrar alerta de éxito
        Swal.fire({
          title: '¡Producto agregado!',
          text: 'El producto se añadió correctamente a tu carrito',
          icon: 'success',
          showCancelButton: true,
          confirmButtonColor: '#33c7d1',
          cancelButtonColor: '#FF1F6D',
          confirmButtonText: 'Ver carrito',
          cancelButtonText: 'Seguir comprando'
        }).then((result) => {
          if (result.isConfirmed) {
            cartStore.toggleCart()
          }
        })
      }
    }

    const registrarInteres = async () => {
      try {
        await productoStore.registrarInteresProducto(props.producto.id)
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

    const openCantidadModal = () => {
      if (props.producto?.agotado) {
        registrarInteres()
      } else if (props.producto?.stock > 0) {
        showCantidadModal.value = true
      }
    }

    const verCarrito = () => {
      cartStore.toggleCart()
      close()
    }

    const tieneProductosEnCarrito = computed(() => {
      return cartStore.items.length > 0
    })

    const selectImage = (index) => {
      currentImageIndex.value = index
      imagenActual.value = index === -1 
        ? props.producto.imagen_url 
        : props.producto.imagenes_adicionales[index]
    }

    const verDetalles = () => {
      router.push(`/productos/${props.producto.id}`)
      close()
    }

    return {
      close,
      formatPrice,
      handleAgregarAlCarrito,
      verCarrito,
      tieneProductosEnCarrito,
      showCantidadModal,
      openCantidadModal,
      precioNormal,
      precioMayoreo,
      mostrarPrecioTachado,
      calcularDescuento,
      explicacionPrecioTachado,
      imagenActual,
      hasPreviousImage,
      hasNextImage,
      previousImage,
      nextImage,
      allImages,
      useDots,
      selectImage,
      verDetalles,
      isZoomed,
      toggleZoom,
      closeCantidadModal
    }
  }
}
</script>

<style scoped>
.quick-view-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
  padding: 0.5rem;
}

.quick-view-content {
  background-color: white;
  border-radius: 12px;
  padding: 1rem;
  width: 100%;
  max-width: 95vw;
  max-height: 95vh;
  overflow-y: auto;
  position: relative;
  margin: 0;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease-out;
  will-change: transform;
}

.close-button {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #333;
  z-index: 1;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.close-button:hover {
  background: #f5f5f5;
  transform: rotate(90deg);
}

.quick-view-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: start;
}

.image-gallery {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.main-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  background-color: #f8f9fa;
  cursor: zoom-in;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
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

.navigation-buttons {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 0.5rem;
  pointer-events: none;
}

.nav-button {
  width: 36px;
  height: 36px;
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

.mini-thumbnails {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  background: rgba(248, 249, 250, 0.5);
  border-radius: 6px;
  margin-top: 0.5rem;
}

.mini-thumbnails::-webkit-scrollbar {
  display: none;
}

.mini-thumb {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  position: relative;
}

.mini-thumb.active {
  border-color: #33c7d1;
  transform: scale(1.05);
}

.mini-thumb:hover:not(.active) {
  transform: scale(1.05);
  border-color: rgba(51, 199, 209, 0.5);
}

.thumb-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.mini-thumb:hover .thumb-preview {
  transform: scale(1.1);
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-header h2 {
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
}

.price-section {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 1rem;
}

.add-to-cart,
.view-cart,
.view-details {
  width: 100%;
  padding: 0.8rem;
  font-size: 0.9rem;
}

@media (min-width: 640px) {
  .quick-view-content {
    padding: 1.5rem;
    max-width: 90vw;
  }

  .product-header h2 {
    font-size: 1.6rem;
  }

  .mini-thumb {
    width: 70px;
    height: 70px;
  }

  .actions {
    flex-direction: row;
  }

  .add-to-cart,
  .view-cart,
  .view-details {
    width: auto;
    flex: 1;
  }
}

@media (min-width: 768px) {
  .quick-view-grid {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .quick-view-content {
    padding: 2rem;
    max-width: 85vw;
  }

  .product-header h2 {
    font-size: 1.8rem;
  }

  .mini-thumb {
    width: 80px;
    height: 80px;
  }
}

@media (min-width: 1024px) {
  .quick-view-content {
    max-width: 80vw;
  }

  .product-header h2 {
    font-size: 2rem;
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stock-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.8rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(5px);
}

.in-stock {
  background-color: rgba(40, 167, 69, 0.9);
  color: white;
}

.out-of-stock {
  background-color: rgba(220, 53, 69, 0.9);
  color: white;
}

.price-tachado {
  text-decoration: line-through;
  color: #999;
  margin-right: 6px;
  font-size: 0.85em;
}

.price-actual {
  color: #FF1F6D;
  font-weight: bold;
}

.descuento-badge {
  background-color: #FF1F6D;
  color: white;
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 0.75em;
  margin-left: 6px;
}

.precio-explicacion {
  font-size: 0.8em;
  color: #666;
  margin-top: 3px;
  font-style: italic;
}

.out-of-stock-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(220, 53, 69, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 2;
}

.mini-thumbnails {
  display: flex;
  gap: 0.8rem;
  padding: 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.mini-thumbnails::-webkit-scrollbar {
  display: none;
}

.mini-thumb {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  position: relative;
}

.mini-thumb.active {
  border-color: #33c7d1;
  transform: scale(1.05);
}

.mini-thumb:hover:not(.active) {
  transform: scale(1.05);
  border-color: rgba(51, 199, 209, 0.5);
}

.thumb-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.mini-thumb:hover .thumb-preview {
  transform: scale(1.1);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 