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

const props = defineProps({
  producto: {
    type: Object,
    required: true
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

const cartStore = useCartStore()
const authStore = useAuthStore()
const cantidad = ref(1)
const showQuantityModal = ref(false)
const router = useRouter()
const productoStore = useProductoStore()
const { share, isSupported } = useShare()

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
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(price)
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
</script>

<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
    <!-- Contenedor de imagen con overlay cuando está agotado -->
    <div class="relative aspect-square overflow-hidden">
      <img 
        :src="producto.imagen_url" 
        :alt="producto.nombre"
        :class="[
          'w-full h-full object-cover object-center transition-all duration-300',
          { 'opacity-50 filter blur-[1px]': producto.estado === 'inactivo' }
        ]"
      />
      
      <!-- Overlay de producto agotado -->
      <div 
        v-if="producto.estado === 'inactivo'"
        class="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-20"
      >
        <span class="bg-red-100 text-red-800 px-4 py-2 rounded-full text-lg font-semibold mb-3">
          Agotado
        </span>
        <button
          @click="registrarInteres"
          class="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium 
                 hover:bg-blue-200 transition-colors flex items-center gap-2"
        >
          <i class="fas fa-bell"></i>
          Notificarme cuando haya stock
        </button>
        <div v-if="producto.interes_count > 0" class="mt-2 text-white text-sm">
          {{ producto.interes_count }} personas interesadas
        </div>
      </div>
    </div>

    <!-- Información del producto -->
    <div class="p-4">
      <!-- Categoría y Marca -->
      <div class="text-xs text-gray-500 mb-1 flex justify-between">
        <span>{{ producto.categoria?.nombre }}</span>
        <span>{{ producto.marca?.nombre }}</span>
      </div>

      <!-- Nombre del producto -->
      <h3 class="text-gray-900 font-semibold mb-3 line-clamp-2 min-h-[2.5rem]">
        {{ producto.nombre }}
      </h3>

      <!-- Precios -->
      <div class="space-y-3 mb-3">
        <!-- Precio unitario con etiqueta según autenticación -->
        <div class="flex justify-between items-center">
          <span class="text-gray-500 text-sm flex items-center gap-1">
            <span>{{ authStore.isAuthenticated ? 'Precio mayorista:' : 'Precio x unidad:' }}</span>
            <svg 
              v-if="authStore.isAuthenticated"
              class="w-4 h-4 text-[#FF1F6D]" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </span>
          <span class="font-semibold text-gray-900">
            Bs. {{ precioNormal }}
          </span>
        </div>

        <!-- Precio por docena destacado -->
        <div class="p-2 bg-[#fff8f9] rounded-lg border-2 border-[#33c7d1] relative">
          <div class="absolute -top-2 -right-2 bg-[#33c7d1] text-white text-xs px-2 py-1 rounded-full">
            ¡Ahorra más!
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[#33c7d1] text-sm font-medium flex items-center gap-1">
              {{ authStore.isAuthenticated ? 'Precio mayorista x docena:' : 'Precio x docena:' }}
              <svg 
                v-if="authStore.isAuthenticated"
                class="w-4 h-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </span>
            <span class="font-bold text-lg text-[#33c7d1]">
              Bs. {{ precioMayoreo }}
            </span>
          </div>
        </div>

        <!-- Mensaje para usuarios no autenticados -->
        <div v-if="!authStore.isAuthenticated" 
             class="text-xs text-gray-500 text-center mt-2">
          <router-link 
            to="/login" 
            class="text-[#FF1F6D] hover:underline"
          >
            Inicia sesión
          </router-link>
          para ver precios mayoristas
        </div>
      </div>

      <!-- Botones -->
      <div class="flex gap-2 mt-4">
        <button 
          @click="openModal"
          class="flex-1 bg-[#FF1F6D] text-white py-2 px-3 rounded-md text-sm font-medium 
                 hover:bg-[#e01a61] transition-all duration-300 transform hover:scale-105 
                 flex items-center justify-center gap-1 group"
        >
          <span>Ver detalles</span>
          <svg 
            class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        
        <div class="flex gap-2">
          <!-- Botón de compartir -->
          <button 
            @click="abrirCompartir"
            class="bg-gray-100 text-gray-700 p-2 rounded-md hover:bg-gray-200 transition-all duration-300"
          >
            <i class="fas fa-share-alt"></i>
          </button>
          
          <!-- Botón de carrito solo si hay stock -->
          <button 
            v-if="producto.estado === 'activo'"
            @click="showQuantityModal = true"
            class="bg-[#33c7d1] text-white p-2 rounded-md hover:bg-[#2ba3ac] transition-all duration-300"
          >
            <i class="fas fa-shopping-cart"></i>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de detalles -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-hidden" role="dialog">
        <!-- Overlay -->
        <div 
          class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          @click="closeAndNavigate"
        ></div>

        <!-- Modal container -->
        <div class="flex min-h-screen items-center justify-center p-4">
          <div 
            class="relative bg-white rounded-lg max-w-3xl w-full mx-auto shadow-xl transform transition-all flex flex-col max-h-[90vh]"
            @click.stop
          >
            <!-- Modal header -->
            <div class="flex items-center justify-between p-4 border-b">
              <h3 class="text-xl font-semibold text-gray-900">
                Detalles del producto
              </h3>
              <button 
                @click="closeAndNavigate"
                class="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Modal content - Scrollable -->
            <div class="flex-1 overflow-y-auto p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Imagen del producto -->
                <div class="aspect-square rounded-lg overflow-hidden">
                  <img 
                    :src="producto.imagen_url" 
                    :alt="producto.nombre"
                    class="w-full h-full object-cover object-center"
                  />
                </div>

                <!-- Información del producto -->
                <div class="space-y-4">
                  <div>
                    <h4 class="text-sm text-gray-500">Categoría</h4>
                    <p class="text-gray-900">{{ producto.categoria?.nombre }}</p>
                  </div>

                  <div>
                    <h4 class="text-sm text-gray-500">Marca</h4>
                    <p class="text-gray-900">{{ producto.marca?.nombre }}</p>
                  </div>

                  <div>
                    <h4 class="text-sm text-gray-500">Nombre del producto</h4>
                    <p class="text-xl font-semibold text-gray-900">{{ producto.nombre }}</p>
                  </div>

                  <div>
                    <h4 class="text-sm text-gray-500">Descripción</h4>
                    <p class="text-gray-700">{{ producto.descripcion || 'Sin descripción disponible' }}</p>
                  </div>

                  <!-- Estado del producto -->
                  <div class="space-y-4">
                    <div class="flex items-center space-x-2">
                      <span 
                        v-if="producto.estado === 'inactivo'"
                        class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold"
                      >
                        Sin Stock
                      </span>
                      <span 
                        v-else
                        class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold"
                      >
                        En Stock
                      </span>
                    </div>
                    
                    <div v-if="producto.estado === 'inactivo'">
                      <button
                        @click="registrarInteres"
                        class="w-full bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium 
                               hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <i class="fas fa-bell"></i>
                        Notificarme cuando haya stock
                      </button>
                      
                      <div v-if="producto.interes_count > 0" 
                           class="mt-2 text-sm text-gray-600 text-center">
                        {{ producto.interes_count }} personas interesadas
                      </div>
                    </div>
                  </div>

                  <!-- Precios -->
                  <div class="space-y-2 pt-4">
                    <div class="flex justify-between items-center">
                      <span class="text-gray-500">
                        {{ authStore.isAuthenticated ? 'Precio mayorista:' : 'Precio normal:' }}
                      </span>
                      <span class="font-semibold text-gray-900">
                        Bs. {{ precioNormal }}
                      </span>
                    </div>

                    <div class="p-3 bg-[#fff8f9] rounded-lg border-2 border-[#33c7d1]">
                      <div class="flex justify-between items-center">
                        <span class="text-[#33c7d1] font-medium">
                          {{ authStore.isAuthenticated ? 'Precio mayorista x docena:' : 'Precio x docena:' }}
                        </span>
                        <span class="font-bold text-lg text-[#33c7d1]">
                          Bs. {{ precioMayoreo }}
                        </span>
                      </div>
                    </div>

                    <!-- Mensaje informativo para usuarios no autenticados -->
                    <div v-if="!authStore.isAuthenticated" 
                         class="text-sm text-gray-500 text-center mt-2">
                      <router-link 
                        to="/login" 
                        class="text-[#FF1F6D] hover:underline"
                        @click="closeAndNavigate"
                      >
                        Inicia sesión
                      </router-link>
                      para acceder a precios mayoristas especiales
                    </div>
                  </div>

                  <!-- Stock -->
                  <!-- <div class="pt-4">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                          :class="producto.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    >
                      {{ producto.stock > 0 ? 'En stock' : 'Sin stock' }}
                    </span>
                  </div> -->
                </div>
              </div>

              <!-- Productos recomendados -->
              <ProductosRecomendados
                :categoria-id="producto.categoria_id"
                :producto-actual-id="producto.id"
                @select-producto="selectRecomendado"
              />

              <div class="flex justify-center gap-3 mt-4">
                <SocialSharing
                  :sharing-data="{
                    url: shareUrl,
                    title: producto.nombre,
                    description: producto.descripcion,
                    quote: `¡Mira este producto en nuestra tienda! ${producto.nombre}`,
                    hashtags: 'tienda,productos'
                  }"
                  :networks="['facebook', 'whatsapp', 'telegram', 'email']"
                  class="flex gap-2"
                  network-tag="button"
                >
                  <template #facebook>
                    <button class="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                      <i class="fab fa-facebook-f"></i>
                    </button>
                  </template>
                  <template #whatsapp>
                    <button class="p-2 bg-green-500 text-white rounded-full hover:bg-green-600">
                      <i class="fab fa-whatsapp"></i>
                    </button>
                  </template>
                  <template #telegram>
                    <button class="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500">
                      <i class="fab fa-telegram-plane"></i>
                    </button>
                  </template>
                  <template #email>
                    <button class="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700">
                      <i class="fas fa-envelope"></i>
                    </button>
                  </template>
                </SocialSharing>
              </div>
            </div>

            <!-- Modal footer - Fijo -->
            <div class="border-t bg-white p-4 sticky bottom-0 left-0 right-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              <div class="flex items-center justify-between gap-3">
                <div class="flex gap-2">
                  <button 
                    @click="closeAndNavigate"
                    class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  >
                    Cerrar
                  </button>
                  <button 
                    @click="abrirCompartir"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 flex items-center gap-2"
                  >
                    <i class="fas fa-share-alt"></i>
                    Compartir
                  </button>
                </div>
                
                <button
                  v-if="producto.estado === 'activo'"
                  @click="showQuantityModal = true"
                  class="bg-[#33c7d1] text-white py-2 px-4 rounded-lg text-sm font-medium 
                         hover:bg-[#2ba3ac] transition-colors flex items-center gap-2"
                >
                  <i class="fas fa-shopping-cart"></i>
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Nuevo modal para selección de cantidad -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showQuantityModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div class="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl">
          <div class="p-4 border-b flex justify-between items-center">
            <h3 class="text-lg font-semibold">Seleccionar cantidad</h3>
            <button @click="showQuantityModal = false" class="p-1 hover:bg-gray-100 rounded-full">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6">
            <!-- Información del producto -->
            <div class="flex gap-4 mb-6">
              <img :src="producto.imagen_url" :alt="producto.nombre" class="w-20 h-20 object-cover rounded"/>
              <div>
                <h4 class="font-medium">{{ producto.nombre }}</h4>
                <p class="text-sm text-gray-500">{{ producto.categoria?.nombre }}</p>
              </div>
            </div>

            <!-- Selector de cantidad -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <div class="flex items-center gap-3">
                <button 
                  @click="updateCantidad(cantidad - 1)"
                  class="p-2 border rounded hover:bg-gray-50"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>
                <input 
                  type="number" 
                  v-model="cantidad"
                  min="1"
                  class="w-20 text-center border rounded p-2"
                  @input="e => updateCantidad(parseInt(e.target.value))"
                />
                <button 
                  @click="updateCantidad(cantidad + 1)"
                  class="p-2 border rounded hover:bg-gray-50"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Información de precios -->
            <div class="space-y-3 mb-6">
              <div class="p-3 bg-gray-50 rounded">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Precio unitario:</span>
                  <span class="font-medium">Bs. {{ precioFinal }}</span>
                </div>
              </div>

              <div class="p-3 bg-[#fff8f9] rounded border-2 border-[#33c7d1]">
                <div class="flex justify-between items-center">
                  <span class="text-[#33c7d1] font-medium">
                    Precio mayorista ({{ producto.cantidad_mayoreo || 12 }}+ unidades):
                  </span>
                  <span class="font-bold text-[#33c7d1]">
                    Bs. {{ precioMayoreo }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex gap-3">
              <button 
                @click="showQuantityModal = false"
                class="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded"
              >
                Seguir comprando
              </button>
              <button 
                @click="addToCart"
                class="flex-1 px-4 py-2 text-white bg-[#33c7d1] hover:bg-[#2ba3ac] rounded"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1);
}

.share-modal .swal2-html-container {
  margin: 1em;
}
</style> 