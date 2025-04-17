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
import { Teleport } from 'vue'

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

const precioFinal = computed(() => {
  const cantidadMayoreo = props.producto.cantidad_mayoreo || 12
  return cantidad.value >= cantidadMayoreo ? precioMayoreo.value : precioNormal.value
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
  document.body.style.overflow = 'hidden'
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

const closeCantidadModal = () => {
  showCantidadModal.value = false
}

const closeQuickView = () => {
  showQuickView.value = false
  document.body.style.overflow = ''
}
</script>

<template>
  <div class="product-card" :class="{ 'out-of-stock': producto.agotado }">
    <div class="product-image-container">
      <img 
        :src="producto.imagen_url || '/placeholder.png'" 
        :alt="producto.nombre"
        @error="handleImageError"
        class="product-image"
        @click="verDetalles"
      />
      
      <!-- Badges -->
      <div class="badges-container">
        <div v-if="producto.agotado" class="badge sold-out">
          Agotado
        </div>
        <div v-else-if="producto.descuento" class="badge discount">
          -{{ producto.descuento }}%
        </div>
        <div v-if="producto.nuevo" class="badge new">
          Nuevo
        </div>
      </div>

      <!-- Acciones móviles -->
      <div class="mobile-actions">
        <button 
          class="action-button add-to-cart"
          @click.stop="openCantidadModal"
          :disabled="producto.agotado"
        >
          <i :class="producto.agotado ? 'fas fa-bell' : 'fas fa-shopping-cart'" class="icon"></i>
          <span class="button-text">{{ producto.agotado ? 'Notificar' : 'Agregar' }}</span>
        </button>
      </div>

      <!-- Acciones desktop -->
      <div class="desktop-actions">
        <button 
          class="action-icon-button view"
          @click.stop="openQuickView"
          title="Vista rápida"
        >
          <i class="fas fa-eye"></i>
        </button>
        <button 
          class="action-icon-button cart"
          @click.stop="openCantidadModal"
          :disabled="producto.agotado"
          :title="producto.agotado ? 'Producto agotado' : 'Agregar al carrito'"
        >
          <i :class="producto.agotado ? 'fas fa-bell' : 'fas fa-shopping-cart'"></i>
        </button>
      </div>
    </div>

    <div class="product-details" @click="verDetalles">
      <div class="category-brand">
        <span class="category">{{ producto.categoria?.nombre || 'Sin categoría' }}</span>
        <span v-if="producto.marca?.nombre" class="brand">{{ producto.marca.nombre }}</span>
      </div>
      
      <h3 class="product-name">{{ producto.nombre }}</h3>
      
      <div class="pricing">
        <div class="price-container">
          <span v-if="producto.precio_anterior" class="original-price">
            Bs. {{ formatPrice(producto.precio_anterior) }}
          </span>
          <span class="current-price">Bs. {{ formatPrice(precioFinal) }}</span>
        </div>
        <div v-if="producto.precio_l2" class="wholesale">
          <span class="wholesale-label">Por mayor:</span>
          <span class="wholesale-price">Bs. {{ formatPrice(producto.precio_l2) }}</span>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <QuickViewModal
        v-if="showQuickView"
        :is-open="showQuickView"
        :producto="producto"
        @close="closeQuickView"
      />
    </Teleport>

    <CantidadModal 
      :is-open="showCantidadModal"
      :producto="producto"
      @close="closeCantidadModal"
      @confirmar="handleAgregarAlCarrito"
    />
  </div>
</template>

<style scoped>
.product-card {
  @apply bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300;
  border: 1px solid #f0f0f0;
}

.product-card:hover {
  @apply shadow-md;
  transform: translateY(-2px);
}

.product-image-container {
  @apply relative overflow-hidden;
  aspect-ratio: 1;
}

.product-image {
  @apply w-full h-full object-cover transition-transform duration-300;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.badges-container {
  @apply absolute top-2 left-2 flex flex-col gap-1;
}

.badge {
  @apply px-2 py-1 rounded-full text-xs font-medium;
}

.badge.sold-out {
  @apply bg-gray-900/80 text-white;
}

.badge.discount {
  @apply bg-red-500/90 text-white;
}

.badge.new {
  @apply bg-emerald-500/90 text-white;
}

/* Estilos específicos para móvil */
@media (max-width: 639px) {
  .product-card {
    width: 100%;
    margin: 0;
  }

  .product-image-container {
    height: 140px;
  }

  .mobile-actions {
    @apply absolute bottom-0 left-0 right-0 p-2;
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  }

  .action-button {
    @apply w-full flex items-center justify-center gap-1 rounded-lg py-1.5 px-2 text-xs font-medium;
  }

  .action-button.add-to-cart {
    @apply bg-white text-gray-900 hover:bg-gray-100;
  }

  .product-details {
    @apply p-2;
  }

  .category-brand {
    @apply flex items-center gap-1 mb-0.5;
  }

  .category, .brand {
    @apply text-[10px] text-gray-500;
  }

  .product-name {
    @apply text-xs font-medium text-gray-900 line-clamp-2 mb-1 leading-tight;
    min-height: 2.4em;
  }

  .current-price {
    @apply text-sm font-semibold;
  }

  .wholesale {
    @apply text-[10px];
  }

  .badge {
    @apply text-[10px] px-1.5 py-0.5;
  }

  .desktop-actions {
    @apply hidden;
  }
}

/* Estilos para desktop */
@media (min-width: 640px) {
  .mobile-actions {
    @apply hidden;
  }

  .desktop-actions {
    @apply absolute inset-0 flex items-center justify-center gap-3 opacity-0 transition-all duration-300;
    background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.7));
  }

  .product-card:hover .desktop-actions {
    @apply opacity-100;
  }

  .action-icon-button {
    @apply w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white hover:text-[#33c7d1] transition-all duration-200 transform hover:scale-110;
  }

  .action-icon-button:disabled {
    @apply opacity-50 cursor-not-allowed hover:scale-100 hover:bg-white/90 hover:text-gray-700;
  }

  .product-details {
    @apply p-4;
  }

  .category-brand {
    @apply flex items-center gap-2 mb-2;
  }

  .category, .brand {
    @apply text-xs text-gray-500;
  }

  .product-name {
    @apply text-base font-medium text-gray-900 line-clamp-2 mb-3 leading-snug;
    min-height: 2.75em;
  }

  .pricing {
    @apply space-y-2;
  }

  .price-container {
    @apply flex items-baseline gap-2;
  }

  .original-price {
    @apply text-sm text-gray-400 line-through;
  }

  .current-price {
    @apply text-lg font-semibold text-gray-900;
  }

  .wholesale {
    @apply flex items-center gap-2 text-sm text-gray-600;
  }

  .wholesale-price {
    @apply font-medium text-gray-800;
  }
}

/* Estado de agotado */
.product-card.out-of-stock {
  @apply opacity-90;
}

.product-card.out-of-stock .product-image {
  @apply grayscale;
}
</style> 