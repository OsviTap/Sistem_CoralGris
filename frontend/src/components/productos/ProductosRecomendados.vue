<template>
  <div v-if="productosRecomendados.length > 0" class="mt-8 border-t pt-6">
    <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
      <svg class="w-6 h-6 text-[#FF1F6D] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      Productos que te podrían interesar
    </h3>

    <div class="space-y-8">
      <div v-if="productosCategoria.length" class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-700">Complementa tu compra</h4>
        
        <!-- Contenedor del carrusel -->
        <div 
          class="relative group mx-auto
                 max-w-[320px] sm:max-w-[600px]" 
          @mouseenter="pauseAutoScroll"
          @mouseleave="resumeAutoScroll"
        >
          <!-- Botones de navegación -->
          <button 
            @click="prevSlide"
            class="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 bg-white rounded-full 
                   p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all z-10 
                   hover:bg-[#FF1F6D] hover:text-white transform hover:scale-110 
                   focus:outline-none"
            :class="{'opacity-0 pointer-events-none': currentIndex === 0}"
          >
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            @click="nextSlide"
            class="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 bg-white rounded-full 
                   p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all z-10 
                   hover:bg-[#FF1F6D] hover:text-white transform hover:scale-110 
                   focus:outline-none"
            :class="{'opacity-0 pointer-events-none': currentIndex >= maxIndex}"
          >
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Carrusel -->
          <div class="overflow-hidden">
            <div 
              class="flex gap-4 sm:gap-6 transition-transform duration-500 ease-out"
              :style="{ transform: `translateX(-${currentIndex * (isMobile ? mobileSlideWidth : slideWidth + 24)}px)` }"
            >
              <div 
                v-for="producto in productosCategoria" 
                :key="producto.id"
                class="w-[280px] sm:w-[270px] flex-shrink-0 transform transition-all duration-300"
              >
                <ProductCard 
                  :producto="producto"
                  class="h-full hover:scale-105 transition-transform duration-300"
                  @click="selectProducto(producto)"
                />
              </div>
            </div>
          </div>

          <!-- Indicadores -->
          <div class="absolute -bottom-6 left-0 right-0 flex justify-center gap-2 sm:gap-3">
            <button 
              v-for="index in totalSlides" 
              :key="index"
              @click="goToSlide(index - 1)"
              class="w-2 h-2 rounded-full transition-all duration-300"
              :class="[
                currentIndex === index - 1 
                  ? 'bg-[#FF1F6D] w-4 sm:w-6' 
                  : 'bg-gray-300 hover:bg-[#FF1F6D]/50'
              ]"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useProductoStore } from '@/stores/producto'
import ProductCard from './ProductCard.vue'

const emit = defineEmits(['select-producto'])

const props = defineProps({
  categoriaId: {
    type: [Number, String],
    required: true
  },
  productoActualId: {
    type: [Number, String],
    required: true
  },
  maxItems: {
    type: Number,
    default: 8
  },
  marcaId: {
    type: [Number, String],
    required: true
  }
})

const productoStore = useProductoStore()
const productosRecomendados = ref([])
const currentIndex = ref(0)
const isMobile = ref(window.innerWidth < 640)

// Configuración del carrusel
const slideWidth = 270 // Ancho de cada card en desktop
const mobileSlideWidth = 280 // Ancho de cada card en móvil
const itemsPerView = computed(() => isMobile.value ? 1 : 2) // Responsive items per view

// Actualizar isMobile en resize
const handleResize = () => {
  isMobile.value = window.innerWidth < 640
}

const productosCategoria = computed(() => 
  productosRecomendados.value.filter(p => p.categoria_id === props.categoriaId)
)

const productosMarca = computed(() => 
  productosRecomendados.value.filter(p => p.marca_id === props.marcaId)
)

const productosMasVendidos = computed(() => 
  productosRecomendados.value.filter(p => p.ventas_totales > 0)
    .sort((a, b) => b.ventas_totales - a.ventas_totales)
)

const maxIndex = computed(() => 
  Math.max(0, productosCategoria.value.length - itemsPerView.value)
)

const totalSlides = computed(() => 
  Math.ceil(productosCategoria.value.length / itemsPerView.value)
)

// Auto-scroll
const autoScrollInterval = ref(null)
const autoScrollDelay = 4000 // 4 segundos

const startAutoScroll = () => {
  if (productosCategoria.value.length > itemsPerView.value) {
    autoScrollInterval.value = setInterval(() => {
      if (currentIndex.value >= maxIndex.value) {
        currentIndex.value = 0 // Volver al inicio suavemente
      } else {
        currentIndex.value++
      }
    }, autoScrollDelay)
  }
}

const pauseAutoScroll = () => {
  if (autoScrollInterval.value) {
    clearInterval(autoScrollInterval.value)
  }
}

const resumeAutoScroll = () => {
  pauseAutoScroll()
  startAutoScroll()
}

// Navegación
const prevSlide = () => {
  pauseAutoScroll()
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const nextSlide = () => {
  pauseAutoScroll()
  if (currentIndex.value < maxIndex.value) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
}

const goToSlide = (index) => {
  pauseAutoScroll()
  currentIndex.value = index
}

const selectProducto = (producto) => {
  emit('select-producto', producto)
}

// Cargar datos
const fetchRecomendados = async () => {
  try {
    const response = await productoStore.fetchProductosRecomendados({
      categoriaId: props.categoriaId,
      excludeId: props.productoActualId,
      limit: props.maxItems
    })
    productosRecomendados.value = response
    currentIndex.value = 0
    resumeAutoScroll()
  } catch (error) {
    console.error('Error al cargar productos recomendados:', error)
  }
}

// Lifecycle
onMounted(() => {
  fetchRecomendados()
  startAutoScroll()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  pauseAutoScroll()
  window.removeEventListener('resize', handleResize)
})

watch(() => props.categoriaId, (newId) => {
  if (newId) {
    fetchRecomendados()
  }
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* Ajustes para touch en móvil */
@media (max-width: 640px) {
  .group {
    touch-action: pan-y pinch-zoom;
  }
}
</style> 