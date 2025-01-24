<script setup>
import { onMounted } from 'vue'
import { useCategoriaStore } from '@/stores/categoria'

const categoriaStore = useCategoriaStore()

onMounted(async () => {
  await categoriaStore.fetchCategorias()
})

// Iconos por categoría (ajusta según tus categorías)
const categoryIcons = {
  'Útiles Escolares': 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  'Oficina': 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25',
  'Arte': 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42',
  'Papelería': 'M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z'
  // Añade más categorías según necesites
}
</script>

<template>
  <div class="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="categoria in categoriaStore.categorias" 
           :key="categoria.id"
           class="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 cursor-pointer overflow-hidden">
        <!-- Fondo decorativo -->
        <div class="absolute inset-0 bg-gradient-to-br from-[#82FFFF]/10 to-[#CF33D1]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <!-- Icono -->
        <div class="relative mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" 
               fill="none" 
               viewBox="0 0 24 24" 
               stroke-width="1.5" 
               stroke="currentColor" 
               class="w-12 h-12 text-[#CF33D1] group-hover:scale-110 transition-transform duration-300">
            <path stroke-linecap="round" 
                  stroke-linejoin="round" 
                  :d="categoryIcons[categoria.nombre] || categoryIcons['Útiles Escolares']" />
          </svg>
        </div>

        <!-- Título -->
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-[#CF33D1] transition-colors duration-300">
          {{ categoria.nombre }}
        </h3>

        <!-- Descripción -->
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Explora nuestra selección de {{ categoria.nombre.toLowerCase() }}
        </p>

        <!-- Botón -->
        <div class="mt-4 flex items-center text-sm font-medium text-[#CF33D1]">
          Ver productos
          <svg xmlns="http://www.w3.org/2000/svg" 
               fill="none" viewBox="0 0 24 24" 
               stroke-width="1.5" 
               stroke="currentColor" 
               class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300">
            <path stroke-linecap="round" 
                  stroke-linejoin="round" 
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template> 