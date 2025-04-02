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
                <img :src="producto.imagen_url || '/placeholder.png'" :alt="producto.nombre">
                <div class="image-overlay">
                  <span class="stock-badge" :class="{ 'in-stock': !producto.agotado, 'out-of-stock': producto.agotado }">
                    {{ producto.agotado ? 'Agotado' : 'En stock' }}
                  </span>
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
                  <span class="price">
                    ${{ formatPrice(producto.precios?.l1 || producto.precio_l1) }}
                  </span>
                </div>
                <div v-if="producto.precios?.l2 || producto.precio_l2" class="mayoreo-price">
                  <span class="price-label">Precio mayoreo:</span>
                  <span class="price">
                    ${{ formatPrice(producto.precios?.l2 || producto.precio_l2) }}
                  </span>
                  <span class="mayoreo-note">
                    (A partir de {{ producto.cantidad_mayoreo || 12 }} unidades)
                  </span>
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
                  :disabled="producto.agotado"
                >
                  <i class="fas fa-shopping-cart"></i>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useProductoStore } from '@/stores/producto'
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
    const showCantidadModal = ref(false)

    const close = () => {
      emit('close')
    }

    const formatPrice = (price) => {
      if (!price) return '0.00'
      return Number(price).toFixed(2)
    }

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

    return {
      close,
      formatPrice,
      handleAgregarAlCarrito,
      verCarrito,
      tieneProductosEnCarrito,
      showCantidadModal,
      openCantidadModal
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
}

.quick-view-content {
  background-color: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 1000px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  margin: 1.5rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #333;
  z-index: 1;
  width: 40px;
  height: 40px;
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
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
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

.image-overlay {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
}

.stock-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
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

.product-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  border-bottom: 1px solid #f8f9fa;
  padding-bottom: 1rem;
}

.product-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  line-height: 1.2;
}

.sku {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
}

.current-price,
.mayoreo-price {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.price-label {
  color: #666;
  font-size: 1rem;
  font-weight: 500;
}

.price {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.mayoreo-price {
  padding-top: 1rem;
  border-top: 2px dashed #dee2e6;
}

.mayoreo-note {
  font-size: 0.9rem;
  color: #666;
  margin-left: auto;
  background: #fff;
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.description {
  color: #666;
  line-height: 1.6;
  font-size: 1rem;
}

.description h3 {
  color: #2c3e50;
  margin-bottom: 0.8rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.product-meta {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1.2rem;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f8f9fa;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1rem;
}

.meta-item i {
  color: #33c7d1;
  font-size: 1.1rem;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(51, 199, 209, 0.1);
  border-radius: 50%;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.8rem;
}

.add-to-cart,
.view-cart {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.add-to-cart {
  background-color: #33c7d1;
  color: white;
  border: none;
  flex: 2;
  box-shadow: 0 4px 15px rgba(51, 199, 209, 0.3);
}

.add-to-cart:hover:not(:disabled) {
  background-color: #2ba3ac;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(51, 199, 209, 0.4);
}

.add-to-cart:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.view-cart {
  background-color: white;
  border: 3px solid #33c7d1;
  color: #33c7d1;
  flex: 1;
  box-shadow: 0 4px 15px rgba(51, 199, 209, 0.1);
}

.view-cart:hover:not(:disabled) {
  background-color: #f8f9fa;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(51, 199, 209, 0.2);
}

.view-cart:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #ccc;
  color: #ccc;
  box-shadow: none;
}

/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@media (max-width: 1024px) {
  .quick-view-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .quick-view-content {
    margin: 1rem;
    padding: 1.5rem;
  }

  .product-header h2 {
    font-size: 1.8rem;
  }

  .price {
    font-size: 1.6rem;
  }
}

@media (max-width: 768px) {
  .quick-view-content {
    padding: 1.2rem;
  }

  .product-header h2 {
    font-size: 1.6rem;
  }

  .price {
    font-size: 1.4rem;
  }

  .add-to-cart,
  .view-cart {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }
}
</style> 