<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-start mb-6">
          <h2 class="text-2xl font-bold text-gray-900">{{ producto.nombre }}</h2>
          <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Carrusel de imágenes -->
          <div class="relative">
            <div class="relative h-96 rounded-lg overflow-hidden">
              <!-- Imagen principal -->
              <img 
                :src="producto.imagen_url" 
                :alt="producto.nombre"
                class="w-full h-full object-cover"
              >
              
              <!-- Carrusel de imágenes adicionales -->
              <div v-if="producto.imagenes_adicionales?.length > 0" 
                class="absolute bottom-4 left-4 right-4 flex space-x-2 overflow-x-auto pb-2">
                <button 
                  v-for="(imagen, index) in producto.imagenes_adicionales"
                  :key="index"
                  @click="imagenActual = imagen"
                  class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2"
                  :class="{'border-[#33c7d1]': imagenActual === imagen, 'border-transparent': imagenActual !== imagen}"
                >
                  <img 
                    :src="imagen" 
                    :alt="`Imagen adicional ${index + 1}`"
                    class="w-full h-full object-cover"
                  >
                </button>
              </div>
            </div>
          </div>

          <!-- Información del producto -->
          <div class="space-y-4">
            <p class="text-gray-600">{{ producto.descripcion }}</p>
            
            <div class="flex items-center space-x-2">
              <span class="text-2xl font-bold text-[#33c7d1]">${{ producto.precio_l1 }}</span>
              <span v-if="producto.precio_l2" class="text-sm text-gray-500">
                (Mayoreo: ${{ producto.precio_l2 }})
              </span>
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-500">Categoría:</span>
              <span class="font-medium">{{ producto.categoria?.nombre }}</span>
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-500">Marca:</span>
              <span class="font-medium">{{ producto.marca?.nombre }}</span>
            </div>

            <div class="pt-4">
              <button 
                @click="agregarAlCarrito"
                class="w-full bg-[#33c7d1] text-white py-2 px-4 rounded-lg hover:bg-[#2ab3bc] transition-colors"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCarritoStore } from '@/stores/carrito';

const props = defineProps({
  producto: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close']);
const carritoStore = useCarritoStore();
const imagenActual = ref(props.producto.imagen_url);

onMounted(() => {
  // Inicializar la imagen actual con la imagen principal
  imagenActual.value = props.producto.imagen_url;
});

const agregarAlCarrito = () => {
  carritoStore.agregarProducto(props.producto);
  emit('close');
};
</script> 