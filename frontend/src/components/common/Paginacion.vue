<script setup>
import { computed } from 'vue'
const props = defineProps({
  paginaActual: {
    type: Number,
    required: true
  },
  totalPaginas: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['cambiar-pagina'])

const pages = computed(() => {
  const pages = []
  const delta = 2 // Número de páginas a mostrar antes y después de la página actual
  
  for (let i = Math.max(2, props.paginaActual - delta); i <= Math.min(props.totalPaginas - 1, props.paginaActual + delta); i++) {
    pages.push(i)
  }

  if (props.paginaActual - delta > 2) {
    pages.unshift('...')
  }
  if (props.paginaActual + delta < props.totalPaginas - 1) {
    pages.push('...')
  }

  if (props.totalPaginas > 1) {
    pages.unshift(1)
    if (props.totalPaginas > 1) {
      pages.push(props.totalPaginas)
    }
  }

  return pages
})

const changePage = (page) => {
  if (page !== '...' && page !== props.paginaActual) {
    emit('cambiar-pagina', page)
  }
}
</script>

<template>
  <nav v-if="totalPaginas > 1" class="flex justify-center mt-8" aria-label="Paginación">
    <!-- Botón anterior -->
    <button
      @click="changePage(paginaActual - 1)"
      :disabled="paginaActual === 1"
      class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span class="sr-only">Anterior</span>
      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- Números de página -->
    <div class="flex">
      <button
        v-for="page in pages"
        :key="page"
        @click="changePage(page)"
        :disabled="page === '...'"
        :class="[
          'relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium',
          page === paginaActual
            ? 'z-10 bg-[#33c7d1] border-[#33c7d1] text-white'
            : 'text-gray-500 hover:bg-gray-50',
          page === '...' ? 'cursor-default' : 'cursor-pointer'
        ]"
      >
        {{ page }}
      </button>
    </div>

    <!-- Botón siguiente -->
    <button
      @click="changePage(paginaActual + 1)"
      :disabled="paginaActual === totalPaginas"
      class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span class="sr-only">Siguiente</span>
      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
    </button>
  </nav>
</template> 