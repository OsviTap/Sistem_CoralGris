<template>
  <header class="sticky top-0 flex flex-col z-50 w-full bg-white text-sm dark:bg-gray-800 rounded-b-lg shadow-[0_4px_0_0_#82FFFF,0_8px_0_0_#FC30E7] relative after:content-[''] after:absolute after:left-0 after:bottom-[-9px] after:w-full after:h-[3px] after:bg-[#FC30E7] after:blur-[1px] before:content-[''] before:absolute before:left-0 before:bottom-[-5px] before:w-full before:h-[3px] before:bg-[#82FFFF] before:blur-[1px]"
        data-hs-header="true">
    <div class="relative max-w-[85rem] mx-auto w-full">
      <!-- Logo y Nombre - Posicionado a la izquierda entre las dos filas -->
      <div class="hidden lg:block absolute left-4 top-1/2 -translate-y-1/2 z-50">
        <div class="flex items-center gap-2">
          <router-link to="/" class="flex items-center gap-2">
            <img src="../../assets/images/logo.png" alt="Logo" class="w-15 h-12">
            <span class="flex-none text-4xl font-spirax">
              <span class="text-[#CF33D1]">Coral</span><span class="text-[#929292]">Gris</span>
            </span>
          </router-link>
        </div>
      </div>

      <!-- Primera fila: Enlaces de navegación -->
      <div class="w-full sm:border-0 dark:border-gray-700">
        <div class="px-4 py-2">
          <div class="flex justify-center items-center">
            <!-- Enlaces - Ocultos en móvil -->
            <div class="hidden sm:flex items-center gap-4">
              <!-- Dropdown Categorías -->
              <div class="hs-dropdown [--trigger:hover] relative inline-flex">
                <button type="button" 
                        class="hs-dropdown-toggle font-medium text-gray-600 hover:text-[#CF33D1] dark:text-gray-400 dark:hover:text-[#CF33D1] px-4 py-2 rounded-full transition-all duration-300 hover:shadow-[0_0_10px_#CF33D1] hover:border hover:border-[#CF33D1] inline-flex justify-center items-center gap-2">
                  Categorías
                  <svg class="hs-dropdown-open:rotate-180 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>

                <div class="hs-dropdown-menu transition-[opacity,margin] duration-[0.1ms] sm:duration-[150ms] hs-dropdown-open:opacity-100 opacity-0 hidden z-[60] sm:mt-2 bg-white shadow-md rounded-lg p-4 dark:bg-gray-800 dark:border dark:border-gray-700 dark:divide-gray-700"
                     data-hs-dropdown-auto-close="inside">
                  <div v-if="categoriaStore.loading" class="p-4 text-center">
                    Cargando categorías...
                  </div>
                  <div v-else-if="categoriaStore.error" class="p-4 text-center text-red-500">
                    {{ categoriaStore.error }}
                  </div>
                  <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div v-for="categoria in categoriaStore.categorias" :key="categoria.id" class="space-y-4">
                      <h3 class="font-semibold text-gray-800 dark:text-white">{{ categoria.nombre }}</h3>
                      <ul class="space-y-2">
                        <li v-for="subcategoria in categoria.subcategorias" :key="subcategoria.id">
                          <a href="#" class="text-gray-600 hover:text-[#CF33D1] dark:text-gray-400">
                            {{ subcategoria.nombre }}
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Dropdown de Marcas -->
              <div class="hs-dropdown [--trigger:hover] relative inline-flex">
                <button type="button" 
                        class="hs-dropdown-toggle font-medium text-gray-600 hover:text-[#CF33D1] dark:text-gray-400 dark:hover:text-[#CF33D1] px-4 py-2 rounded-full transition-all duration-300 hover:shadow-[0_0_10px_#CF33D1] hover:border hover:border-[#CF33D1] inline-flex justify-center items-center gap-2">
                  Marcas
                  <svg class="hs-dropdown-open:rotate-180 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>

                <div class="hs-dropdown-menu transition-[opacity,margin] duration-[0.1ms] sm:duration-[150ms] hs-dropdown-open:opacity-100 opacity-0 hidden z-[60] sm:mt-2 bg-white shadow-md rounded-lg p-4 dark:bg-gray-800 dark:border dark:border-gray-700 dark:divide-gray-700"
                     data-hs-dropdown-auto-close="inside">
                  <div v-if="marcaStore.loading" class="p-4 text-center">
                    <span class="text-gray-500">Cargando marcas...</span>
                  </div>
                  
                  <div v-else-if="marcaStore.error" class="p-4 text-center">
                    <span class="text-red-500">{{ marcaStore.error }}</span>
                  </div>
                  
                  <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <!-- Columna 1 (A-C) -->
                    <div class="space-y-4">
                      <h3 class="font-semibold text-gray-800 dark:text-white border-b pb-2">A - C</h3>
                      <ul class="space-y-2">
                        <li v-for="marca in marcaStore.marcasPorColumna.columna1" 
                            :key="marca.id">
                          <a href="#" class="text-gray-600 hover:text-[#CF33D1] dark:text-gray-400">
                            {{ marca.nombre }}
                          </a>
                        </li>
                      </ul>
                    </div>

                    <!-- Columna 2 (D-L) -->
                    <div class="space-y-4">
                      <h3 class="font-semibold text-gray-800 dark:text-white border-b pb-2">D - L</h3>
                      <ul class="space-y-2">
                        <li v-for="marca in marcaStore.marcasPorColumna.columna2" 
                            :key="marca.id">
                          <a href="#" class="text-gray-600 hover:text-[#CF33D1] dark:text-gray-400">
                            {{ marca.nombre }}
                          </a>
                        </li>
                      </ul>
                    </div>

                    <!-- Columna 3 (M-P) -->
                    <div class="space-y-4">
                      <h3 class="font-semibold text-gray-800 dark:text-white border-b pb-2">M - P</h3>
                      <ul class="space-y-2">
                        <li v-for="marca in marcaStore.marcasPorColumna.columna3" 
                            :key="marca.id">
                          <a href="#" class="text-gray-600 hover:text-[#CF33D1] dark:text-gray-400">
                            {{ marca.nombre }}
                          </a>
                        </li>
                      </ul>
                    </div>

                    <!-- Columna 4 (R-Z) -->
                    <div class="space-y-4">
                      <h3 class="font-semibold text-gray-800 dark:text-white border-b pb-2">R - Z</h3>
                      <ul class="space-y-2">
                        <li v-for="marca in marcaStore.marcasPorColumna.columna4" 
                            :key="marca.id">
                          <a href="#" class="text-gray-600 hover:text-[#CF33D1] dark:text-gray-400">
                            {{ marca.nombre }}
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <router-link 
                to="/nosotros" 
                class="font-medium text-gray-600 hover:text-[#CF33D1] dark:text-gray-400 dark:hover:text-[#CF33D1] px-4 py-2 rounded-full transition-all duration-300 hover:shadow-[0_0_10px_#CF33D1] hover:border hover:border-[#CF33D1]"
              >
                Nosotros
              </router-link>
              <router-link 
                to="/contacto" 
                class="font-medium text-gray-600 hover:text-[#CF33D1] dark:text-gray-400 dark:hover:text-[#CF33D1] px-4 py-2 rounded-full transition-all duration-300 hover:shadow-[0_0_10px_#CF33D1] hover:border hover:border-[#CF33D1]"
              >
                Contacto
              </router-link>
              <router-link 
                to="/registrar-negocio" 
                class="font-medium text-gray-600 hover:text-[#CF33D1] dark:text-gray-400 dark:hover:text-[#CF33D1] px-4 py-2 rounded-full transition-all duration-300 hover:shadow-[0_0_10px_#CF33D1] hover:border hover:border-[#CF33D1]"
              >
                Registra tu negocio o empresa
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Segunda fila: Logo (móvil/tablet), buscador e iconos -->
      <div class="w-full">
        <div class="px-4 py-4">
          <div class="flex items-center justify-between gap-4">
            <!-- Logo y Nombre - Solo visible en móvil y tablet -->
            <div class="flex items-center gap-2 flex-shrink-0 lg:hidden">
              <router-link to="/" class="flex items-center gap-2">
                <img src="../../assets/images/logo.png" alt="Logo" class="w-15 h-12">
                <span class="flex-none text-2xl font-spirax">
                  <span class="text-[#CF33D1]">Coral</span><span class="text-[#929292]">Gris</span>
                </span>
              </router-link>
            </div>

            <!-- Buscador e iconos -->
            <div class="hidden sm:flex items-center gap-4 flex-grow justify-end lg:w-1/3 lg:ml-auto">
              <!-- Buscador -->
              <div class="relative max-w-md w-full">
                <input type="text" 
                       class="w-full py-2 px-4 pr-10 rounded-full border border-gray-300 focus:border-[#CF33D1] focus:ring focus:ring-[#CF33D1] focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                       placeholder="Buscar productos, categorías o marcas...">
                <button class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#CF33D1]">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </button>
              </div>

              <!-- Iconos -->
              <div class="flex items-center gap-4">
                <a href="#" class="text-gray-600 hover:text-[#CF33D1] transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </a>
                <a href="#" class="text-gray-600 hover:text-[#CF33D1] transition-colors relative">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <span class="absolute -top-2 -right-2 bg-[#CF33D1] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">0</span>
                </a>
              </div>
            </div>

            <!-- Versión móvil de iconos y botón hamburguesa -->
            <div class="flex items-center gap-4 sm:hidden">
              <!-- Botón de búsqueda móvil -->
              <button type="button" 
                      class="mobile-search-button text-gray-600 hover:text-[#CF33D1]"
                      @click="toggleMobileSearch">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>

              <!-- Iconos de usuario y carrito -->
              <a href="#" class="text-gray-600 hover:text-[#CF33D1] transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </a>
              <a href="#" class="text-gray-600 hover:text-[#CF33D1] transition-colors relative">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span class="absolute -top-2 -right-2 bg-[#CF33D1] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">0</span>
              </a>

              <!-- Botón hamburguesa -->
              <button type="button" 
                      class="hs-collapse-toggle size-8 flex justify-center items-center text-sm font-semibold rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700" 
                      data-hs-collapse="#navbar-collapse-with-animation" 
                      aria-controls="navbar-collapse-with-animation" 
                      aria-label="Toggle navigation">
                <svg class="hs-collapse-open:hidden w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
                <svg class="hs-collapse-open:block hidden w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Buscador móvil expandible -->
          <div v-show="showMobileSearch" 
               class="mobile-search-container sm:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-50 px-4 py-3">
            <div class="relative">
              <input type="text" 
                     class="w-full py-2 px-4 pr-10 rounded-full border border-gray-300 focus:border-[#CF33D1] focus:ring focus:ring-[#CF33D1] focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                     placeholder="Buscar productos, categorías o marcas..."
                     ref="searchInput"
                     @keyup.esc="closeMobileSearch">
              <button class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#CF33D1]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Menú móvil -->
          <div id="navbar-collapse-with-animation" class="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow sm:hidden mt-4">
            <div class="flex flex-col gap-4">
              <a class="font-medium text-gray-600 hover:text-[#CF33D1]" href="#">Categorías</a>
              <a class="font-medium text-gray-600 hover:text-[#CF33D1]" href="#">Marcas</a>
              <router-link 
                to="/nosotros" 
                class="font-medium text-gray-600 hover:text-[#CF33D1]"
              >
                Nosotros
              </router-link>
              <router-link 
                to="/contacto" 
                class="font-medium text-gray-600 hover:text-[#CF33D1]"
              >
                Contacto
              </router-link>
              <router-link 
                to="/registrar-negocio" 
                class="font-medium text-gray-600 hover:text-[#CF33D1]"
              >
                Registra tu negocio o empresa
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- <CartPanel /> -->
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useCategoriaStore } from '@/stores/categoria'
import { useMarcaStore } from '@/stores/marca'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import CartPanel from '../cart/CartPanel.vue'
import 'preline'

const showMobileSearch = ref(false)
const searchInput = ref(null)
const categoriaStore = useCategoriaStore()
const marcaStore = useMarcaStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
const isOpen = ref(false)
const isLoading = ref(true)

const toggleMobileSearch = async () => {
  showMobileSearch.value = !showMobileSearch.value
  if (showMobileSearch.value) {
    await nextTick()
    searchInput.value?.focus()
  }
}

const closeMobileSearch = () => {
  showMobileSearch.value = false
}

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const totalItems = computed(() => cartStore.totalItems)

// Computed property simplificada
const categorias = computed(() => {
  return categoriaStore.getCategorias || []
})

// Computed properties para marcas
const marcasDestacadas = computed(() => marcaStore.marcasDestacadas || [])
const marcasNoDestacadas = computed(() => marcaStore.marcasNoDestacadas || [])

onMounted(async () => {
  try {
    await Promise.all([
      categoriaStore.fetchCategorias(),
      marcaStore.fetchMarcas()
    ])

    await nextTick(() => {
      if (window.HSDropdown) {
        window.HSDropdown.autoInit()
      }
    })
  } catch (error) {
    console.error('Error al cargar datos:', error)
  } finally {
    isLoading.value = false
  }

  // Manejador de clics fuera del buscador
  document.addEventListener('click', (event) => {
    if (showMobileSearch.value) {
      const searchContainer = document.querySelector('.mobile-search-container')
      const searchButton = document.querySelector('.mobile-search-button')
      const isClickInside = searchContainer?.contains(event.target) || searchButton?.contains(event.target)
      
      if (!isClickInside) {
        showMobileSearch.value = false
      }
    }
  })
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Spirax&display=swap');

.font-spirax {
  font-family: 'Spirax', cursive;
}

/* Estilos base para los dropdowns */
.hs-dropdown {
  position: relative;
}

.hs-dropdown-menu {
  position: fixed !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  z-index: 1000 !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  margin-top: 3rem !important;
  transition-duration: 1000ms !important;
}

/* Pantallas grandes (lg y superiores) */
@media (min-width: 1024px) {
  .hs-dropdown-menu {
    width: 1200px !important;
  }
}

/* Pantallas medianas (sm hasta lg) */
@media (min-width: 640px) and (max-width: 1023px) {
  .hs-dropdown-menu {
    width: 750px !important;
  }
}

/* Pantallas móviles */
@media (max-width: 639px) {
  .hs-dropdown-menu {
    width: calc(100vw - 2rem) !important;
    left: 50% !important;
    right: auto !important;
  }
}

/* Comportamiento hover */
@media (min-width: 640px) {
  .hs-dropdown:hover .hs-dropdown-menu {
    display: block !important;
    opacity: 1 !important;
  }
}

/* Asegurar que el contenido del dropdown use todo el ancho disponible */
.hs-dropdown-menu .grid {
  width: 100%;
}

/* Estilos para el buscador móvil */
.mobile-search-enter-active,
.mobile-search-leave-active {
  transition: all 0.3s ease;
}

.mobile-search-enter-from,
.mobile-search-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Añadir transición suave al scroll */
.sticky {
  transition: all 0.3s ease-in-out;
}

/* Estilo cuando el header está scrolleado */
.hs-header-scrolled {
  box-shadow: 0 4px 0 0 #82FFFF, 0 8px 0 0 #FC30E7, 0 1px 10px rgba(0,0,0,0.1);
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.95);
}

/* Versión dark mode */
.dark .hs-header-scrolled {
  background-color: rgba(31, 41, 55, 0.95);
}
</style>
