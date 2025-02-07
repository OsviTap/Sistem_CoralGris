<script setup>
import { computed, ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import ProductosRecomendados from './ProductosRecomendados.vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

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
</script>

<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
    <!-- Imagen del producto -->
    <div class="relative aspect-square overflow-hidden">
      <img 
        :src="producto.imagen_url" 
        :alt="producto.nombre"
        class="w-full h-full object-cover object-center transform transition-transform duration-300 group-hover:scale-110"
      />
      <!-- Badge de stock -->
      <div 
        v-if="producto.stock > 0" 
        class="absolute top-2 left-2 bg-[#33c7d1] text-white text-xs font-medium px-2 py-1 rounded-full"
      >
        Stock disponible
      </div>
      <!-- Nuevo: Badge de precios mayoristas para usuarios autenticados -->
      <div 
        v-if="authStore.isAuthenticated" 
        class="absolute top-2 right-2 bg-[#FF1F6D] text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1"
      >
        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Precios mayoristas
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
      <div class="grid grid-cols-5 gap-2 mt-4">
        <button 
          @click="openModal"
          class="col-span-4 bg-[#FF1F6D] text-white py-2 px-3 rounded-md text-sm font-medium 
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
        <button 
          @click="showQuantityModal = true"
          class="bg-[#33c7d1] text-white p-2 rounded-md hover:bg-[#2ba3ac] transition-all duration-300 
                 transform hover:scale-110 flex items-center justify-center"
          v-if="producto.stock > 0"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
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
                  <div class="pt-4">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                          :class="producto.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    >
                      {{ producto.stock > 0 ? 'En stock' : 'Sin stock' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Productos recomendados -->
              <ProductosRecomendados
                :categoria-id="producto.categoria_id"
                :producto-actual-id="producto.id"
                @select-producto="selectRecomendado"
              />
            </div>

            <!-- Modal footer - Fijo -->
            <div class="border-t bg-white p-4 sticky bottom-0 left-0 right-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              <div class="flex items-center justify-end gap-3">
                <button 
                  @click="closeAndNavigate"
                  class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                >
                  Cerrar
                </button>
                <button 
                  v-if="producto.stock > 0"
                  @click="showQuantityModal = true"
                  class="px-6 py-2 text-sm font-medium text-white bg-[#33c7d1] hover:bg-[#2ba3ac] rounded-md transition-colors duration-200 flex items-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
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
</style> 