<template>
  <div v-if="productosRecomendados.length > 0" class="mt-8 border-t pt-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <svg class="w-5 h-5 text-[#FF1F6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      Productos que te podrían interesar
    </h3>

    <!-- Secciones de recomendaciones -->
    <div class="space-y-6">
      <!-- Complementa tu compra -->
      <div v-if="productosCategoria.length" class="space-y-3">
        <h4 class="text-sm font-medium text-gray-500">Complementa tu compra</h4>
        <div class="relative">
          <div class="overflow-hidden">
            <div class="flex gap-4 transition-transform duration-500"
                 :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
              <ProductCard 
                v-for="producto in productosCategoria"
                :key="producto.id"
                :producto="producto"
                class="min-w-[250px] flex-shrink-0"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Más de la marca -->
      <div v-if="productosMarca.length" class="space-y-3">
        <h4 class="text-sm font-medium text-gray-500">
          Más productos {{ props.producto?.marca?.nombre }}
        </h4>
        <!-- Similar carrusel para productosMarca -->
      </div>

      <!-- Los más vendidos -->
      <div v-if="productosMasVendidos.length" class="space-y-3">
        <h4 class="text-sm font-medium text-gray-500">Los más vendidos</h4>
        <!-- Similar carrusel para productosMasVendidos -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useProductoStore } from '@/stores/producto'
import ProductCard from './ProductCard.vue'

const props = defineProps({
  producto: {
    type: Object,
    required: true
  },
  maxItems: {
    type: Number,
    default: 8
  }
})

const productoStore = useProductoStore()
const productosRecomendados = ref([])
const currentIndex = ref(0)

// Separar productos por tipo
const productosCategoria = computed(() => 
  productosRecomendados.value.filter(p => p.categoria_id === props.producto?.categoria_id)
)

const productosMarca = computed(() => 
  productosRecomendados.value.filter(p => p.marca_id === props.producto?.marca_id)
)

const productosMasVendidos = computed(() => 
  productosRecomendados.value.filter(p => p.ventas_totales > 0)
    .sort((a, b) => b.ventas_totales - a.ventas_totales)
)

// Cargar recomendaciones
const fetchRecomendados = async () => {
  // Verificar que el producto existe y tiene ID
  if (!props.producto?.id) {
    console.log('No hay producto para obtener recomendaciones');
    return;
  }

  try {
    const response = await productoStore.fetchProductosRecomendados({
      categoriaId: props.producto.categoria_id,
      marcaId: props.producto.marca_id,
      excludeId: props.producto.id,
      limit: props.maxItems
    })
    productosRecomendados.value = response
  } catch (error) {
    console.error('Error al cargar productos recomendados:', error)
  }
}

// Recargar cuando cambie el producto
watch(() => props.producto?.id, (newId) => {
  if (newId) {
    fetchRecomendados()
  }
}, { immediate: true })

// No necesitamos onMounted si usamos immediate: true en el watch
</script> 