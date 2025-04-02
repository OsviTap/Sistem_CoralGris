<script setup>
import { computed, ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import ProductosRecomendados from './ProductosRecomendados.vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { useProductoStore } from '@/stores/producto'
import { useShare } from '@vueuse/core'
import SocialSharing from 'vue3-social-sharing'
import QuickViewModal from './QuickViewModal.vue'
import { defineProps, defineEmits } from 'vue'
import CantidadModal from './CantidadModal.vue'

const props = defineProps({
  producto: {
    type: Object,
    required: true,
    default: () => ({
      nombre: '',
      imagen_url: '',
      categoria: { nombre: '' },
      marca: { nombre: '' },
      precios: { l1: 0, l2: 0 },
      precio_l1: 0,
      precio_l2: 0,
      agotado: false
    })
  },
  showPreciosMayoristas: {
    type: Boolean,
    default: false
  },
  nivelPrecio: {
    type: String,
    default: 'L1'
  },
  showAsPage: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['agregar-al-carrito'])
const cartStore = useCartStore()
const authStore = useAuthStore()
const cantidad = ref(1)
const showQuantityModal = ref(false)
const router = useRouter()
const productoStore = useProductoStore()
const { share, isSupported } = useShare()
const showQuickView = ref(false)
const showCantidadModal = ref(false)

const shareUrl = computed(() => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/productos/${props.producto.id}`
  }
  return ''
})

// Computed properties para precios
const precioNormal = computed(() => {
  if (authStore.isAuthenticated && authStore.user?.nivel_precio) {
    return props.producto[`precio_${authStore.user.nivel_precio.toLowerCase()}`]
  }
  return props.producto.precio_l1
})

const precioMayoreo = computed(() => {
  if (authStore.isAuthenticated && authStore.user?.nivel_precio) {
    const nivelActual = authStore.user.nivel_precio
    const nivelSiguiente = {
      'L1': 'L2',
      'L2': 'L3',
      'L3': 'L4',
      'L4': 'L4'
    }[nivelActual]
    return props.producto[`precio_${nivelSiguiente.toLowerCase()}`]
  }
  // Para usuarios no autenticados o sin nivel, mostrar precio L2
  return props.producto.precio_l2
})

const precioFinal = computed(() => {
  const cantidadMayoreo = props.producto.cantidad_mayoreo || 12
  return cantidad.value >= cantidadMayoreo ? precioMayoreo.value : precioNormal.value
})

const formatPrice = (price) => {
  if (!price) return '0.00'
  return Number(price).toFixed(2)
}

const addToCart = () => {
  cartStore.addItem({
    ...props.producto,
    cantidad: cantidad.value,
    precio: precioFinal.value
  })
  showQuantityModal.value = false
  cantidad.value = 1

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
}

const updateCantidad = (value) => {
  if (value >= 1 && value <= props.producto.stock) {
    cantidad.value = value
  }
}

const showModal = ref(false)

const openModal = () => {
  showModal.value = true
  document.body.style.overflow = 'hidden'
  registrarInteresAutomatico()
}

const closeAndNavigate = () => {
  showModal.value = false
  showQuantityModal.value = false
  document.body.style.overflow = ''
  
  // Solo navegar si estamos en la vista de detalle del producto
  if (props.showAsPage) {
    const currentPath = '/productos'
    router.push({
      path: currentPath,
      query: router.currentRoute.value.query
    })
  }
}

const selectRecomendado = () => {
  closeAndNavigate()
}

const getPrecioSegunNivel = computed(() => {
  const nivel = props.nivelPrecio.toLowerCase()
  return props.producto[`precio_${nivel}`] || props.producto.precio_l1
})

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

const registrarInteresAutomatico = () => {
  if (props.producto.estado === 'inactivo' && showModal.value) {
    setTimeout(async () => {
      try {
        await productoStore.registrarInteresProducto(props.producto.id)
      } catch (error) {
        // Silenciosamente ignoramos errores de registro previo
        if (!error.response?.status === 429) {
          console.error('Error al registrar interés automático:', error)
        }
      }
    }, 30000) // 30 segundos
  }
}

const abrirCompartir = async () => {
  const shareData = {
    title: props.producto.nombre,
    text: props.producto.descripcion || `¡Mira este producto en nuestra tienda! ${props.producto.nombre}`,
    url: shareUrl.value,
  }

  try {
    if (isSupported.value) {
      // Usar API nativa de compartir
      await share(shareData)
    } else {
      // Fallback para navegadores que no soportan la API Share
      const modalContent = `
        <div class="space-y-4">
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input type="text" value="${shareUrl.value}" 
                   class="flex-1 p-2 border rounded" readonly>
            <button onclick="navigator.clipboard.writeText('${shareUrl.value}')
                           .then(() => Swal.showValidationMessage('¡Enlace copiado!'))"
                    class="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
              <i class="fas fa-copy"></i>
            </button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <a href="https://wa.me/?text=${encodeURIComponent(`${shareData.text} ${shareData.url}`)}" 
               target="_blank" 
               class="flex items-center justify-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600">
              <i class="fab fa-whatsapp"></i>
              WhatsApp
            </a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}" 
               target="_blank"
               class="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <i class="fab fa-facebook-f"></i>
              Facebook
            </a>
          </div>
        </div>
      `

      await Swal.fire({
        title: 'Compartir producto',
        html: modalContent,
        showConfirmButton: false,
        showCloseButton: true,
        customClass: {
          container: 'share-modal'
        }
      })
    }

    // Registrar interés si el producto está inactivo
    if (props.producto.estado === 'inactivo') {
      try {
        await productoStore.registrarInteresProducto(props.producto.id)
      } catch (error) {
        if (!error.response?.status === 429) {
          console.error('Error al registrar interés:', error)
        }
      }
    }
  } catch (error) {
    console.error('Error al compartir:', error)
  }
}

const openQuickView = () => {
  showQuickView.value = true
}

const handleAgregarAlCarrito = (cantidadSeleccionada, precioFinal) => {
  if (!props.producto?.agotado) {
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
  }
}

const verDetalles = () => {
  if (props.producto?.id) {
    router.push(`/productos/${props.producto.id}`)
  }
}

const handleImageError = (e) => {
  e.target.src = '/placeholder.png'
}

const openCantidadModal = () => {
  if (!props.producto.agotado) {
    showCantidadModal.value = true
  }
}
</script>

<template>
  <div>
    <div class="product-card">
      <div class="product-image">
        <img 
          :src="producto.imagen_url || '/placeholder.png'" 
          :alt="producto.nombre"
          @error="handleImageError"
        />
        <div class="product-overlay">
          <button 
            class="quick-view-btn"
            @click.stop="openQuickView"
          >
            <i class="fas fa-eye"></i>
          </button>
          <button 
            class="add-to-cart-btn"
            @click.stop="openCantidadModal"
            :disabled="producto.agotado"
          >
            <i class="fas fa-shopping-cart"></i>
          </button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-category">
          {{ producto.categoria?.nombre || 'Sin categoría' }}
        </div>
        <h3 class="product-name">{{ producto.nombre || 'Sin nombre' }}</h3>
        <div class="product-brand" v-if="producto.marca?.nombre">
          {{ producto.marca.nombre }}
        </div>
        <div class="product-price">
          <span class="current-price">
            ${{ formatPrice(producto.precios?.l1 || producto.precio_l1) }}
          </span>
          <span class="original-price" v-if="producto.precios?.l2 || producto.precio_l2">
            ${{ formatPrice(producto.precios?.l2 || producto.precio_l2) }}
          </span>
        </div>
        <div class="product-stock" :class="{ 'out-of-stock': producto.agotado }">
          {{ producto.agotado ? 'Agotado' : 'En stock' }}
        </div>
      </div>
    </div>

    <!-- Modal de vista rápida -->
    <Teleport to="body">
      <QuickViewModal
        v-if="showQuickView"
        :is-open="showQuickView"
        :producto="producto"
        @close="showQuickView = false"
      />
    </Teleport>

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
.product-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
  position: relative;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.1);
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.quick-view-btn,
.add-to-cart-btn {
  background: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.quick-view-btn:hover,
.add-to-cart-btn:hover {
  transform: scale(1.1);
}

.add-to-cart-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.product-info {
  padding: 1rem;
}

.product-category {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.product-brand {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.current-price {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.original-price {
  font-size: 1rem;
  color: #666;
  text-decoration: line-through;
}

.product-stock {
  font-size: 0.875rem;
  color: #28a745;
}

.product-stock.out-of-stock {
  color: #dc3545;
}
</style> 