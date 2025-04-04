<template>
  <div>
    <Transition name="fade">
      <div v-if="isOpen" class="quick-view-overlay" @click.self="close">
        <div class="quick-view-content">
          <button class="close-button" @click="close">&times;</button>
          
          <div class="quick-view-grid">
            <!-- Galería de imágenes -->
            <div class="image-gallery">
              <div class="main-image">
                <img 
                  :src="imagenActual" 
                  :alt="producto.nombre"
                  class="w-full h-full object-cover"
                >
                <!-- Botones de navegación -->
                <div v-if="producto.imagenes_adicionales?.length > 0" class="navigation-buttons">
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

                <div v-if="producto.agotado" class="out-of-stock-badge">
                  <i class="fas fa-exclamation-circle"></i>
                  Agotado
                </div>
                <div v-else class="stock-badge">
                  <i class="fas fa-check-circle"></i>
                  Disponible
                </div>
              </div>

              <!-- Indicadores de imágenes (puntos o miniaturas) -->
              <div v-if="producto.imagenes_adicionales?.length > 0" 
                class="image-indicators mt-4"
              >
                <!-- Opción 1: Puntos indicadores -->
                <div v-if="useDots" class="dots-container">
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

                <!-- Opción 2: Miniaturas pequeñas con blur -->
                <div v-else class="mini-thumbnails">
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
        :is-open="showCantidadModal"
        :producto="producto"
        @close="showCantidadModal = false"
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
    const currentImageIndex = ref(-1) // -1 representa la imagen principal
    const useDots = ref(true) // Cambiar a false para usar miniaturas pequeñas

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

    const close = () => {
      emit('close')
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
            cartStore.toggleCart() // Abrir el panel del carrito
          }
        })

        showCantidadModal.value = false
        close()
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
      if (props.producto.agotado) {
        registrarInteres()
      } else {
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
      verDetalles
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
  padding: 1rem;
}

.quick-view-content {
  background-color: white;
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 900px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  margin: 0;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease-out;
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
  gap: 2rem;
  align-items: start;
}

.image-gallery {
  position: sticky;
  top: 0;
}

.main-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
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
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
  margin-top: 1rem;
}

.dots-container {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  padding: 0.5rem;
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

.product-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.8rem;
  border-bottom: 1px solid #f8f9fa;
  padding-bottom: 0.8rem;
}

.product-header h2 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  line-height: 1.2;
}

.sku {
  background: #f8f9fa;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1.2rem;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.price-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #33c7d1, #FF1F6D);
}

.current-price,
.mayoreo-price {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.price-label {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.mayoreo-price {
  padding-top: 0.8rem;
  border-top: 2px dashed #dee2e6;
}

.mayoreo-note {
  font-size: 0.8rem;
  color: #666;
  margin-left: auto;
  background: #fff;
  padding: 0.3rem 0.6rem;
  border-radius: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.description {
  color: #666;
  line-height: 1.5;
  font-size: 0.9rem;
}

.description h3 {
  color: #2c3e50;
  margin-bottom: 0.6rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.product-meta {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1rem;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f8f9fa;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
}

.meta-item i {
  color: #33c7d1;
  font-size: 1rem;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(51, 199, 209, 0.1);
  border-radius: 50%;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 0.5rem;
  background: linear-gradient(to right, rgba(248, 249, 250, 0.5), rgba(255, 255, 255, 0.8));
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
}

.add-to-cart,
.view-cart,
.view-details {
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.add-to-cart {
  background: linear-gradient(135deg, #33c7d1, #2ba3ac);
  color: white;
  border: none;
  flex: 2;
  box-shadow: 0 4px 15px rgba(51, 199, 209, 0.3);
}

.add-to-cart:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(51, 199, 209, 0.4);
  background: linear-gradient(135deg, #2ba3ac, #33c7d1);
}

.add-to-cart:active:not(:disabled) {
  transform: translateY(-1px);
}

.add-to-cart i {
  font-size: 1.1rem;
  transition: transform 0.3s ease;
}

.add-to-cart:hover i {
  transform: translateX(-3px);
}

.view-cart {
  background: white;
  border: 2px solid #33c7d1;
  color: #33c7d1;
  flex: 1;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.view-cart::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background: linear-gradient(135deg, rgba(51, 199, 209, 0.1), rgba(43, 163, 172, 0.2));
  transition: width 0.3s ease;
  z-index: -1;
}

.view-cart:hover:not(:disabled)::before {
  width: 100%;
}

.view-cart:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(51, 199, 209, 0.15);
  color: #2ba3ac;
}

.view-details {
  background: white;
  border: 2px solid #6c757d;
  color: #6c757d;
  flex: 1;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.view-details::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background: linear-gradient(135deg, #6c757d, #495057);
  transition: width 0.3s ease;
  z-index: -1;
}

.view-details:hover:not(:disabled)::before {
  width: 100%;
}

.view-details:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(108, 117, 125, 0.2);
  color: white;
  border-color: transparent;
}

.view-details i {
  font-size: 1.1rem;
  transition: transform 0.3s ease;
}

.view-details:hover i {
  transform: scale(1.1);
}

@media (min-width: 640px) {
  .quick-view-content {
    padding: 1.5rem;
    margin: 1rem;
  }

  .product-header h2 {
    font-size: 1.8rem;
  }

  .price {
    font-size: 1.6rem;
  }
}

@media (min-width: 768px) {
  .quick-view-grid {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .quick-view-content {
    padding: 2rem;
    margin: 1.5rem;
  }

  .product-header h2 {
    font-size: 2rem;
  }

  .price {
    font-size: 1.8rem;
  }

  .actions {
    flex-direction: row;
  }

  .add-to-cart,
  .view-cart,
  .view-details {
    width: auto;
  }
}

@media (min-width: 1024px) {
  .quick-view-content {
    padding: 2.5rem;
    margin: 2rem;
  }

  .product-header h2 {
    font-size: 2.2rem;
  }

  .price {
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
</style> 