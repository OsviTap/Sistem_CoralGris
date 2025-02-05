<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductoStore } from '@/stores/producto'
import ProductCard from '@/components/productos/ProductCard.vue'

const route = useRoute()
const productoStore = useProductoStore()
const producto = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    loading.value = true
    // Asumiendo que tienes un método para obtener un producto por ID
    const productoData = await productoStore.fetchProductoById(route.params.id)
    producto.value = productoData
  } catch (error) {
    console.error('Error al cargar el producto:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="loading-spinner"></div>
    </div>
    
    <div v-else-if="producto" class="product-detail">
      <ProductCard 
        :producto="producto"
        :showAsPage="true"
      />
    </div>
    
    <div v-else class="text-center text-gray-600">
      Producto no encontrado
    </div>
  </div>
</template> 