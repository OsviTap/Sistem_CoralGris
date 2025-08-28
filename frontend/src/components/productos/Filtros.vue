<script setup>
import { ref, watch } from 'vue'
import { useCategoriaStore } from '@/stores/categoria'
import { useMarcaStore } from '@/stores/marca'

const emit = defineEmits(['aplicar-filtros'])

const categoriaStore = useCategoriaStore()
const marcaStore = useMarcaStore()

const filtros = ref({
  categoria_id: '',
  marca_id: '',
  orden: '',
  search: ''
})

const ordenOptions = [
  { value: '', label: 'Más recientes' },
  { value: 'precio_asc', label: 'Menor precio' },
  { value: 'precio_desc', label: 'Mayor precio' },
  { value: 'nombre_asc', label: 'A-Z' },
  { value: 'nombre_desc', label: 'Z-A' }
]

// Emitir cambios cuando se modifiquen los filtros
watch(filtros, (newFiltros) => {
  const filtrosLimpios = {}
  
  // Incluir todos los filtros, incluso los vacíos, para que el store pueda manejarlos correctamente
  filtrosLimpios.categoria_id = newFiltros.categoria_id
  filtrosLimpios.marca_id = newFiltros.marca_id
  filtrosLimpios.search = newFiltros.search
  filtrosLimpios.orden = newFiltros.orden
  
  console.log('Emitiendo filtros desde componente:', filtrosLimpios)
  emit('aplicar-filtros', filtrosLimpios)
}, { deep: true })

const resetFiltros = () => {
  filtros.value = {
    categoria_id: '',
    marca_id: '',
    orden: '',
    search: ''
  }
  // Emitir evento para limpiar filtros
  emit('aplicar-filtros', {})
}
</script>

<template>
  <div class="space-y-6">
    <!-- Búsqueda -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Buscar
      </label>
      <input
        type="text"
        v-model="filtros.search"
        placeholder="Buscar productos..."
        class="w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1]"
      />
    </div>

    <!-- Categorías -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Categoría
      </label>
      <select
        v-model="filtros.categoria_id"
        class="w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1]"
      >
        <option value="">Todas las categorías</option>
        <option
          v-for="categoria in categoriaStore.categorias"
          :key="categoria.id"
          :value="categoria.id"
        >
          {{ categoria.nombre }}
        </option>
      </select>
    </div>

    <!-- Marcas -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Marca
      </label>
      <select
        v-model="filtros.marca_id"
        class="w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1]"
      >
        <option value="">Todas las marcas</option>
        <option
          v-for="marca in marcaStore.marcas"
          :key="marca.id"
          :value="marca.id"
        >
          {{ marca.nombre }}
        </option>
      </select>
    </div>

    <!-- Ordenar por -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Ordenar por
      </label>
      <select
        v-model="filtros.orden"
        class="w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1]"
      >
        <option
          v-for="option in ordenOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>

    <!-- Botón reset -->
    <button
      @click="resetFiltros"
      class="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#33c7d1]"
    >
      Limpiar filtros
    </button>
  </div>
</template> 