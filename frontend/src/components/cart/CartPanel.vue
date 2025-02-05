<script setup>
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(price)
}

const handleCheckout = () => {
  cartStore.toggleCart() // Cerrar el panel
  router.push('/checkout')
}

const continuarComprando = () => {
  cartStore.toggleCart()
  router.push('/productos')
}

const eliminarProducto = (id) => {
  cartStore.removeItem(id)
}

const actualizarCantidad = (id, cantidad) => {
  if (cantidad > 0) {
    cartStore.updateQuantity(id, cantidad)
  }
}
</script>

<template>
  <div 
    v-show="cartStore.isOpen"
    class="fixed inset-0 overflow-hidden z-50"
    aria-labelledby="slide-over-title" 
    role="dialog" 
    aria-modal="true"
  >
    <!-- Overlay -->
    <div 
      class="absolute inset-0 overflow-hidden"
      @click="cartStore.toggleCart"
    >
      <div class="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
    </div>

    <div class="fixed inset-y-0 right-0 pl-10 max-w-full flex">
      <div class="w-screen max-w-md">
        <div class="h-full flex flex-col bg-white shadow-xl">
          <!-- Header -->
          <div class="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
            <div class="flex items-start justify-between">
              <h2 class="text-lg font-medium text-gray-900">
                Carrito de compras
              </h2>
              <button 
                @click="cartStore.toggleCart"
                class="ml-3 h-7 flex items-center"
              >
                <span class="sr-only">Cerrar panel</span>
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Lista de productos -->
            <div class="mt-8">
              <div class="flow-root">
                <ul role="list" class="-my-6 divide-y divide-gray-200">
                  <li v-for="item in cartStore.items" :key="item.id" class="py-6 flex">
                    <div class="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                      <img
                        :src="item.imagen_url"
                        :alt="item.nombre"
                        class="w-full h-full object-center object-cover"
                      >
                    </div>

                    <div class="ml-4 flex-1 flex flex-col">
                      <div>
                        <div class="flex justify-between text-base font-medium text-gray-900">
                          <h3>{{ item.nombre }}</h3>
                          <p class="ml-4">{{ formatPrice(item.precio * item.cantidad) }}</p>
                        </div>
                      </div>
                      <div class="flex-1 flex items-end justify-between text-sm">
                        <div class="flex items-center space-x-2">
                          <button 
                            @click="actualizarCantidad(item.id, item.cantidad - 1)"
                            class="text-gray-500 hover:text-gray-700"
                          >-</button>
                          <span class="font-medium">{{ item.cantidad }}</span>
                          <button 
                            @click="actualizarCantidad(item.id, item.cantidad + 1)"
                            class="text-gray-500 hover:text-gray-700"
                          >+</button>
                        </div>

                        <button 
                          @click="eliminarProducto(item.id)"
                          class="font-medium text-red-600 hover:text-red-500"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="border-t border-gray-200 py-6 px-4 sm:px-6">
            <div class="flex justify-between text-base font-medium text-gray-900">
              <p>Total</p>
              <p>{{ formatPrice(cartStore.total) }}</p>
            </div>
            <p class="mt-0.5 text-sm text-gray-500">
              Envío calculado al finalizar la compra.
            </p>
            <div class="mt-6">
              <button
                @click="handleCheckout"
                class="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#33c7d1] hover:bg-[#2ba3ac]"
                :disabled="cartStore.isEmpty"
              >
                Finalizar compra
              </button>
            </div>
            <div class="mt-6 flex justify-center text-sm text-center text-gray-500">
              <p>
                o
                <button
                  @click="continuarComprando"
                  class="text-[#33c7d1] font-medium hover:text-[#2ba3ac] ml-1"
                >
                  Continuar comprando
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 