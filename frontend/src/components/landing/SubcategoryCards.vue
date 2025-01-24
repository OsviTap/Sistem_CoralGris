<script setup>
import { onMounted, computed } from 'vue'
import { useCategoriaStore } from '@/stores/categoria'

const categoriaStore = useCategoriaStore()

onMounted(async () => {
  await categoriaStore.fetchCategorias()
})

// Iconos por subcategoría (ajusta según tus subcategorías)
const subcategoryIcons = {
  // Útiles Escolares
  'Cuadernos': 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10',
  'Lápices': 'M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184',
  'Mochilas': 'M2.25 2.25a.75.75 0 000 1.5H3v10.5a3 3 0 003 3h1.21l-1.172 3.513a.75.75 0 001.424.474l.329-.987h8.418l.33.987a.75.75 0 001.422-.474l-1.17-3.513H18a3 3 0 003-3V3.75h.75a.75.75 0 000-1.5H2.25zm6.04 16.5l.5-1.5h6.42l.5 1.5H8.29zm7.46-12a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0v-6zm-3 2.25a.75.75 0 00-1.5 0v3.75a.75.75 0 001.5 0V9zm-3 2.25a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5z',
  
  // Papelería
  'Papel': 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  'Sobres': 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
  
  // Arte
  'Pinceles': 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42',
  'Lienzos': 'M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122',
  
  // Por defecto
  'default': 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9'
}

// Obtener todas las subcategorías de todas las categorías
const allSubcategories = computed(() => {
  return categoriaStore.categorias.reduce((acc, categoria) => {
    if (categoria.subcategorias) {
      return [...acc, ...categoria.subcategorias]
    }
    return acc
  }, [])
})
</script>

<template>
  <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="subcategoria in allSubcategories" 
           :key="subcategoria.id"
           class="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
        <router-link :to="`/productos?subcategoria=${subcategoria.id}`"
                    class="block p-6">
          <!-- Fondo decorativo con gradiente más visible -->
          <div class="absolute inset-0 bg-gradient-to-br from-[#82FFFF]/20 to-[#33c7d1]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <!-- Contenedor del icono centrado -->
          <div class="flex flex-col items-center">
            <!-- Círculo decorativo detrás del icono -->
            <div class="relative mb-6">
              <div class="absolute inset-0 bg-[#33c7d1]/10 rounded-full transform scale-150 group-hover:scale-175 transition-transform duration-300"></div>
              <div class="relative p-4">
                <svg xmlns="http://www.w3.org/2000/svg" 
                     fill="none" 
                     viewBox="0 0 24 24" 
                     stroke-width="1.5" 
                     stroke="currentColor" 
                     class="w-16 h-16 text-[#33c7d1] group-hover:scale-110 transition-all duration-300 transform group-hover:rotate-3">
                  <path stroke-linecap="round" 
                        stroke-linejoin="round" 
                        :d="subcategoryIcons[subcategoria.nombre] || subcategoryIcons.default" />
                </svg>
              </div>
            </div>

            <!-- Contenido centrado -->
            <div class="text-center relative z-10">
              <h3 class="text-xl font-semibold text-gray-800 dark:text-white group-hover:text-[#33c7d1] transition-colors duration-300">
                {{ subcategoria.nombre }}
              </h3>
              
              <p class="mt-3 text-sm text-gray-600 dark:text-gray-300">
                Explora nuestra selección de {{ subcategoria.nombre.toLowerCase() }}
              </p>

              <!-- Botón con mejor visibilidad -->
              <div class="mt-4 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-[#33c7d1] group-hover:text-white bg-transparent group-hover:bg-[#33c7d1] rounded-full transition-all duration-300">
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
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Añadir efecto de elevación en hover */
.group:hover {
  transform: translateY(-4px);
}

/* Asegurar que la transición sea suave */
.group {
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style> 