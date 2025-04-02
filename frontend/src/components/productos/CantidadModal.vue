<template>
  <div>
    <Transition name="fade">
      <div v-if="isOpen" class="cantidad-modal-overlay" @click.self="$emit('close')">
        <div class="cantidad-modal-content">
          <button class="close-button" @click="$emit('close')">&times;</button>
          
          <div class="modal-header">
            <h2>Seleccionar cantidad</h2>
            <div class="product-info">
              <img :src="producto.imagen_url || '/placeholder.png'" :alt="producto.nombre">
              <div class="product-details">
                <h3>{{ producto.nombre }}</h3>
                <div class="sku" v-if="producto.codigo_sku">
                  SKU: {{ producto.codigo_sku }}
                </div>
              </div>
            </div>
          </div>

          <div class="price-info">
            <div class="price-section">
              <div class="current-price">
                <span class="price-label">Precio unitario:</span>
                <span class="price">${{ formatPrice(precioUnitario) }}</span>
              </div>
              <div class="total-price">
                <span class="price-label">Total:</span>
                <span class="price">${{ formatPrice(precioFinal) }}</span>
              </div>
            </div>

            <div v-if="tienePrecioMayoreo" class="mayoreo-info">
              <div class="mayoreo-header">
                <i class="fas fa-percentage"></i>
                <span>Precio por mayoreo disponible</span>
              </div>
              <div class="mayoreo-details">
                <div class="mayoreo-price">
                  <span class="price-label">Precio mayoreo:</span>
                  <span class="price">${{ formatPrice(producto.precios?.l2 || producto.precio_l2) }}</span>
                </div>
                <div class="mayoreo-savings" v-if="cantidad >= cantidadMayoreo">
                  <span class="savings-label">Ahorro por unidad:</span>
                  <span class="savings-amount">${{ formatPrice(ahorroPorUnidad) }}</span>
                </div>
                <div class="mayoreo-total" v-if="cantidad >= cantidadMayoreo">
                  <span class="price-label">Total con mayoreo:</span>
                  <span class="price">${{ formatPrice(precioFinalMayoreo) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="cantidad-controls">
            <div class="cantidad-input">
              <button @click="decrementarCantidad" :disabled="cantidad <= 1">
                <i class="fas fa-minus"></i>
              </button>
              <input 
                type="number" 
                v-model="cantidad" 
                min="1"
                @input="validarCantidad"
              >
              <button @click="incrementarCantidad">
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <div class="cantidad-info">
              <span v-if="cantidad >= cantidadMayoreo" class="mayoreo-badge">
                <i class="fas fa-check-circle"></i>
                Aplicando precio mayoreo
              </span>
              <span v-else class="mayoreo-remaining">
                Faltan {{ cantidadMayoreo - cantidad }} unidades para precio mayoreo
              </span>
            </div>
          </div>

          <div class="modal-actions">
            <button class="cancel-button" @click="$emit('close')">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
            <button class="confirm-button" @click="confirmarCantidad">
              <i class="fas fa-check"></i>
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'CantidadModal',
  
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

  emits: ['close', 'confirmar'],

  setup(props, { emit }) {
    const cantidad = ref(1)

    const precioUnitario = computed(() => {
      return props.producto.precios?.l1 || props.producto.precio_l1
    })

    const cantidadMayoreo = computed(() => {
      return props.producto.cantidad_mayoreo || 12
    })

    const tienePrecioMayoreo = computed(() => {
      return props.producto.precios?.l2 || props.producto.precio_l2
    })

    const precioFinal = computed(() => {
      return precioUnitario.value * cantidad.value
    })

    const precioFinalMayoreo = computed(() => {
      if (!tienePrecioMayoreo.value) return precioFinal.value
      return (props.producto.precios?.l2 || props.producto.precio_l2) * cantidad.value
    })

    const ahorroPorUnidad = computed(() => {
      if (!tienePrecioMayoreo.value) return 0
      return precioUnitario.value - (props.producto.precios?.l2 || props.producto.precio_l2)
    })

    const incrementarCantidad = () => {
      cantidad.value++
    }

    const decrementarCantidad = () => {
      if (cantidad.value > 1) {
        cantidad.value--
      }
    }

    const validarCantidad = () => {
      if (cantidad.value < 1) {
        cantidad.value = 1
      }
    }

    const confirmarCantidad = () => {
      const precioFinal = cantidad.value >= cantidadMayoreo.value
        ? precioFinalMayoreo.value
        : precioFinal.value
      emit('confirmar', cantidad.value, precioFinal)
    }

    return {
      cantidad,
      precioUnitario,
      precioFinal,
      precioFinalMayoreo,
      cantidadMayoreo,
      tienePrecioMayoreo,
      ahorroPorUnidad,
      incrementarCantidad,
      decrementarCantidad,
      validarCantidad,
      confirmarCantidad,
      formatPrice: (price) => Number(price).toFixed(2)
    }
  }
}
</script>

<style scoped>
.cantidad-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(8px);
}

.cantidad-modal-content {
  background-color: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  position: relative;
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

.modal-header {
  margin-bottom: 2rem;
  text-align: center;
}

.modal-header h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.product-info img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.product-details {
  text-align: left;
}

.product-details h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.sku {
  font-size: 0.9rem;
  color: #666;
}

.price-info {
  margin-bottom: 2rem;
}

.price-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.current-price,
.total-price {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.price-label {
  font-size: 0.9rem;
  color: #666;
}

.price {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
}

.mayoreo-info {
  background: rgba(51, 199, 209, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.mayoreo-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #33c7d1;
  font-weight: 600;
  margin-bottom: 1rem;
}

.mayoreo-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mayoreo-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mayoreo-savings {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  background: rgba(40, 167, 69, 0.1);
  border-radius: 8px;
}

.savings-label {
  color: #28a745;
  font-weight: 500;
}

.savings-amount {
  color: #28a745;
  font-weight: 700;
  font-size: 1.2rem;
}

.mayoreo-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 2px dashed rgba(51, 199, 209, 0.2);
}

.cantidad-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.cantidad-input {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cantidad-input button {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: none;
  background: #f8f9fa;
  color: #2c3e50;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cantidad-input button:hover:not(:disabled) {
  background: #e9ecef;
  transform: scale(1.1);
}

.cantidad-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cantidad-input input {
  width: 100px;
  text-align: center;
  font-size: 1.5rem;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 0.5rem;
}

.cantidad-info {
  text-align: center;
}

.mayoreo-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
  border-radius: 20px;
  font-weight: 500;
}

.mayoreo-remaining {
  color: #666;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.cancel-button,
.confirm-button {
  flex: 1;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.cancel-button {
  background: #f8f9fa;
  color: #666;
  border: none;
}

.cancel-button:hover {
  background: #e9ecef;
}

.confirm-button {
  background: #33c7d1;
  color: white;
  border: none;
}

.confirm-button:hover {
  background: #2ba3ac;
  transform: translateY(-2px);
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

@media (max-width: 768px) {
  .cantidad-modal-content {
    padding: 1.5rem;
  }

  .modal-header h2 {
    font-size: 1.5rem;
  }

  .product-info {
    flex-direction: column;
    text-align: center;
  }

  .product-details {
    text-align: center;
  }

  .price-section {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .mayoreo-details {
    text-align: center;
  }

  .mayoreo-price,
  .mayoreo-savings,
  .mayoreo-total {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style> 