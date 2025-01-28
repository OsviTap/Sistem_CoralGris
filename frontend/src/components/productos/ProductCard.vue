<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'

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
  }
})

const cartStore = useCartStore()

const precio = computed(() => {
  switch (props.nivelPrecio) {
    case 'L2':
      return props.producto.precio_l2
    case 'L3':
      return props.producto.precio_l3
    case 'L4':
      return props.producto.precio_l4
    default:
      return props.producto.precio_l1
  }
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(price)
}

const addToCart = () => {
  cartStore.addItem({
    id: props.producto.id,
    nombre: props.producto.nombre,
    precio: precio.value,
    imagen_url: props.producto.imagen_url,
    cantidad: 1
  })
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
    <!-- Imagen del producto -->
    <div class="relative aspect-square overflow-hidden bg-gray-200">
      <img 
        :src="producto.imagen_url || '/img/placeholder-producto.png'"
        :alt="producto.nombre"
        class="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-300"
      />
      <div 
        v-if="producto.stock <= 0"
        class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold"
      >
        Agotado
      </div>
    </div>

    <!-- Información del producto -->
    <div class="p-4">
      <!-- Categoría y marca -->
      <div class="flex justify-between items-center text-sm text-gray-500 mb-2">
        <span>{{ producto.categoria?.nombre }}</span>
        <span>{{ producto.marca?.nombre }}</span>
      </div>

      <!-- Nombre del producto -->
      <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {{ producto.nombre }}
      </h3>

      <!-- Precios -->
      <div class="space-y-2">
        <!-- Precio normal -->
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-500">Precio unitario:</span>
          <span class="text-lg font-bold text-gray-900">{{ formatPrice(producto.precio_l1) }}</span>
        </div>

        <!-- Precio por docena -->
        <div class="flex justify-between items-center text-sm">
          <span class="text-gray-500">Precio por docena:</span>
          <span class="font-semibold text-[#33c7d1]">{{ formatPrice(producto.precio_l2) }}</span>
        </div>

        <!-- Precios mayoristas (solo si está autenticado) -->
        <template v-if="showPreciosMayoristas">
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500">Precio mayorista:</span>
            <span class="font-semibold text-[#33c7d1]">{{ formatPrice(producto.precio_l3) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500">Precio distribuidor:</span>
            <span class="font-semibold text-[#33c7d1]">{{ formatPrice(producto.precio_l4) }}</span>
          </div>
        </template>
      </div>

      <!-- Stock -->
      <div class="mt-2 text-sm text-gray-500">
        Stock disponible: {{ producto.stock }}
      </div>

      <!-- Botón agregar al carrito -->
      <button
        @click="addToCart"
        :disabled="producto.stock <= 0"
        class="mt-4 w-full bg-[#33c7d1] text-white py-2 px-4 rounded-md hover:bg-[#2ba3ac] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
        {{ producto.stock > 0 ? 'Agregar al carrito' : 'Agotado' }}
      </button>
    </div>
  </div>
</template> 