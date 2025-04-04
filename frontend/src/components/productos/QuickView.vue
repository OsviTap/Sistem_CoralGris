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
                <button 
                  class="view-details"
                  @click="verDetalles"
                >
                  <i class="fas fa-search-plus"></i>
                  Ver más detalles
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
  name: 'QuickView',
  
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

  emits: ['close', 'agregar-al-carrito'],

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
      emit('agregar-al-carrito', cantidadSeleccionada, precioFinal)
      close()
    }

    const verCarrito = () => {
      cartStore.toggleCart()
      close()
    }

    const tieneProductosEnCarrito = computed(() => {
      return cartStore.items.length > 0
    })

    const openCantidadModal = async () => {
      if (props.producto.agotado) {
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
      } else {
        showCantidadModal.value = true
      }
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
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
  padding: 1rem;
}

.quick-view-content {
  background-color: white;
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 1000px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  margin: 0;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease-out;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  z-index: 1;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f5f5f5;
  color: #333;
  transform: rotate(90deg);
}

.quick-view-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.image-gallery {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
}

.main-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.main-image:hover img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.stock-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.3s ease;
}

.stock-badge:hover {
  transform: translateY(-2px);
}

.in-stock {
  background-color: #28a745;
  color: white;
}

.out-of-stock {
  background-color: #dc3545;
  color: white;
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
  gap: 1rem;
  border-bottom: 1px solid #f8f9fa;
  padding-bottom: 1rem;
}

.product-header h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  flex: 1;
}

.sku {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #666;
  transition: transform 0.3s ease;
}

.sku:hover {
  transform: translateY(-2px);
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.2rem;
  background: #f8f9fa;
  border-radius: 12px;
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
  gap: 0.5rem;
}

.price-label {
  color: #666;
  font-size: 0.9rem;
}

.price {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  position: relative;
}

.price::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #33c7d1, transparent);
}

.mayoreo-price {
  padding-top: 0.5rem;
  border-top: 1px solid #dee2e6;
}

.mayoreo-note {
  font-size: 0.9rem;
  color: #666;
  margin-left: auto;
  background: #fff;
  padding: 0.3rem 0.6rem;
  border-radius: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.description {
  color: #666;
  line-height: 1.6;
}

.description h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.product-meta {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  color: #666;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.3s ease;
}

.meta-item:hover {
  transform: translateX(5px);
}

.meta-item i {
  color: #33c7d1;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.add-to-cart,
.view-cart,
.view-details {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  position: relative;
  overflow: hidden;
}

.add-to-cart {
  background-color: #33c7d1;
  color: white;
  border: none;
  flex: 2;
}

.add-to-cart:hover:not(:disabled) {
  background-color: #2ba3ac;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(51, 199, 209, 0.3);
}

.add-to-cart:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.view-cart {
  background-color: transparent;
  border: 2px solid #33c7d1;
  color: #33c7d1;
  flex: 1;
}

.view-cart:hover:not(:disabled) {
  background-color: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(51, 199, 209, 0.1);
}

.view-cart:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #ccc;
  color: #ccc;
}

.view-details {
  background-color: #f8f9fa;
  border: 2px solid #6c757d;
  color: #6c757d;
  flex: 1;
}

.view-details:hover {
  background-color: #6c757d;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.2);
}

/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (min-width: 640px) {
  .quick-view-content {
    padding: 2rem;
    margin: 1rem;
  }

  .product-header h2 {
    font-size: 2rem;
  }

  .price {
    font-size: 2rem;
  }
}

@media (min-width: 768px) {
  .quick-view-grid {
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }

  .quick-view-content {
    padding: 2.5rem;
    margin: 1.5rem;
  }

  .product-header {
    flex-direction: row;
    gap: 1.5rem;
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
    padding: 3rem;
    margin: 2rem;
  }

  .product-header h2 {
    font-size: 2.2rem;
  }

  .price {
    font-size: 2.2rem;
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
</style> 