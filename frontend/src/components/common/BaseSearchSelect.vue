<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  searchFunction: {
    type: Function,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Buscar...'
  }
})

const emit = defineEmits(['select'])

const searchQuery = ref('')
const searchResults = ref([])
const loading = ref(false)
const showResults = ref(false)

let debounceTimeout

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  try {
    loading.value = true
    const results = await props.searchFunction(searchQuery.value)
    searchResults.value = results
  } catch (error) {
    console.error('Error en la búsqueda:', error)
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

const handleSelect = (item) => {
  emit('select', item)
  searchQuery.value = ''
  searchResults.value = []
  showResults.value = false
}

watch(searchQuery, () => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(handleSearch, 300)
})
</script>

<template>
  <div class="relative">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>
    
    <div class="relative">
      <input
        type="text"
        v-model="searchQuery"
        :placeholder="placeholder"
        @focus="showResults = true"
        class="w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1]"
      />
      
      <div v-if="loading" class="absolute right-3 top-2.5">
        <i class="fas fa-spinner fa-spin text-gray-400"></i>
      </div>
    </div>

    <!-- Resultados de búsqueda -->
    <div
      v-if="showResults && searchResults.length > 0"
      class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto"
    >
      <ul class="py-1">
        <li
          v-for="item in searchResults"
          :key="item.id"
          @click="handleSelect(item)"
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
        >
          <span>{{ item.nombre }}</span>
          <span class="text-sm text-gray-500">
            {{ new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(item.precio_l1) }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template> 