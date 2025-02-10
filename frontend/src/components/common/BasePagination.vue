<script setup>
import { computed } from 'vue'
const props = defineProps({
  totalPages: {
    type: Number,
    required: true
  },
  currentPage: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['page-change'])

const changePage = (page) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('page-change', page)
  }
}

const pageNumbers = computed(() => {
  const pages = []
  const maxVisiblePages = 5
  let startPage = Math.max(1, props.currentPage - 2)
  let endPage = Math.min(props.totalPages, startPage + maxVisiblePages - 1)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  return pages
})
</script>

<template>
  <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700">
          Mostrando
          <span class="font-medium">{{ totalItems }}</span>
          resultados
        </p>
      </div>
      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
          >
            Anterior
          </button>
          
          <button
            v-for="page in pageNumbers"
            :key="page"
            @click="changePage(page)"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium"
            :class="page === currentPage ? 'bg-[#33c7d1] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
          >
            {{ page }}
          </button>
          
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
          >
            Siguiente
          </button>
        </nav>
      </div>
    </div>
  </div>
</template> 