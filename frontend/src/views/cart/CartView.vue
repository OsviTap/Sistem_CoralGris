<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import Navbar from '@/components/landing/Navbar.vue'
import Footer from '@/components/landing/Footer.vue'

const cartStore = useCartStore()
const router = useRouter()

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(price)
}

const continuarCompra = () => {
  router.push('/checkout')
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />
    
    <main class="flex-grow bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row gap-8">
          <!-- Lista de productos -->
          <div class="flex-grow">
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-2xl font-bold mb-6">Carrito de Compras</h2>

              <div v-if="cartStore.isEmpty" class="text-center py-12">
                <p class="text-gray-500 mb-4">Tu carrito está vacío</p>
                <router-link 
                  to="/productos"
                  class="text-[#33c7d1] hover:text-[#2ba3ac]"
                >
                  Ver productos
                </router-link>
              </div>

              <div v-else class="space-y-6">
                <!-- Productos normales -->
                <div v-if="cartStore.itemsByPriceType.normal">
                  <h3 class="font-medium text-gray-900 mb-4">Productos precio normal</h3>
                  <div class="space-y-4">
                    <div 
                      v-for="item in cartStore.itemsByPriceType.normal" 
                      :key="item.id"
                      class="flex gap-4 p-4 border rounded-lg"
                    >
                      <img 
                        :src="item.imagen_url" 
                        :alt="item.nombre"
                        class="w-24 h-24 object-cover rounded"
                      />
                      <div class="flex-grow">
                        <h4 class="font-medium">{{ item.nombre }}</h4>
                        <p class="text-sm text-gray-500">{{ item.categoria?.nombre }}</p>
                        <div class="mt-2 flex items-center gap-4">
                          <div class="flex items-center gap-2">
                            <button 
                              @click="cartStore.updateQuantity(item.id, Math.max(1, item.cantidad - 1))"
                              class="p-1 border rounded hover:bg-gray-50"
                            >
                              -
                            </button>
                            <span class="w-8 text-center">{{ item.cantidad }}</span>
                            <button 
                              @click="cartStore.updateQuantity(item.id, item.cantidad + 1)"
                              class="p-1 border rounded hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                          <span class="font-medium">{{ formatPrice(item.precio * item.cantidad) }}</span>
                        </div>
                      </div>
                      <button 
                        @click="cartStore.removeItem(item.id)"
                        class="text-gray-400 hover:text-red-500"
                      >
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Productos mayoreo -->
                <div v-if="cartStore.itemsByPriceType.mayoreo">
                  <h3 class="font-medium text-gray-900 mb-4">Productos precio mayorista</h3>
                  <!-- Similar al bloque anterior pero para productos mayoristas -->
                </div>
              </div>
            </div>
          </div>

          <!-- Resumen -->
          <div class="w-full md:w-80">
            <div class="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 class="text-lg font-medium mb-4">Resumen del pedido</h3>
              
              <div class="space-y-4">
                <div class="flex justify-between">
                  <span class="text-gray-600">Subtotal</span>
                  <span class="font-medium">{{ formatPrice(cartStore.subtotal) }}</span>
                </div>
                
                <div class="border-t pt-4">
                  <button
                    @click="continuarCompra"
                    class="w-full bg-[#33c7d1] text-white py-3 px-4 rounded-lg hover:bg-[#2ba3ac] transition-colors"
                    :disabled="cartStore.isEmpty"
                  >
                    Continuar compra
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template> 