<template>
  <footer class="w-full bg-gray-900 relative">
    <!-- Borde superior con efecto neón similar al navbar -->
    <div class="absolute top-0 left-0 w-full h-[2px] bg-[#82FFFF] blur-[1px]"></div>
    <div class="absolute top-[3px] left-0 w-full h-[2px] bg-[#CF33D1] blur-[1px]"></div>

    <div class="w-full py-10 px-4 sm:px-6 lg:px-8 lg:pt-20 mx-auto">
      <!-- Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <div class="col-span-full lg:col-span-1">
          <a class="flex-none text-4xl font-spirax mb-4" href="#" aria-label="Brand">
            <span class="text-[#CF33D1]">Coral</span><span class="text-[#929292]">Gris</span>
          </a>
          <p class="text-gray-400 text-sm">Tu tienda de confianza para útiles escolares y de oficina.</p>
        </div>
        <!-- End Col -->

        <div class="col-span-1">
          <h4 class="font-semibold text-[#82FFFF]">Productos</h4>
          <div class="mt-3 grid space-y-3">
            <p><a class="inline-flex gap-x-2 text-gray-400 hover:text-[#CF33D1] transition-colors duration-300" href="#">Libros</a></p>
            <p><a class="inline-flex gap-x-2 text-gray-400 hover:text-[#CF33D1] transition-colors duration-300" href="#">Útiles</a></p>
            <p><a class="inline-flex gap-x-2 text-gray-400 hover:text-[#CF33D1] transition-colors duration-300" href="#">Ofertas</a></p>
          </div>
        </div>

        <div class="col-span-1">
          <h4 class="font-semibold text-[#82FFFF]">Empresa</h4>
          <div class="mt-3 grid space-y-3">
            <p><a class="inline-flex gap-x-2 text-gray-400 hover:text-[#CF33D1] transition-colors duration-300" href="#">Sobre nosotros</a></p>
            <p><a class="inline-flex gap-x-2 text-gray-400 hover:text-[#CF33D1] transition-colors duration-300" href="#">Blog</a></p>
            <p><a class="inline-flex gap-x-2 text-gray-400 hover:text-[#CF33D1] transition-colors duration-300" href="#">Contacto</a></p>
          </div>
        </div>

        <div class="col-span-2">
          <h4 class="font-semibold text-[#82FFFF]">Mantente informado</h4>
          <form>
            <div class="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:gap-3 bg-gray-800 rounded-lg p-2">
              <div class="w-full">
                <label for="hero-input" class="sr-only">Buscar</label>
                <input type="text" id="hero-input" name="hero-input" 
                       class="py-3 px-4 block w-full border-transparent rounded-lg text-sm focus:border-[#CF33D1] focus:ring-[#CF33D1] bg-gray-700 text-gray-400" 
                       placeholder="Ingresa tu email">
              </div>
              <a class="w-full sm:w-auto whitespace-nowrap p-3 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-[#CF33D1] text-white hover:bg-[#82FFFF] hover:text-gray-900 transition-colors duration-300" href="#">
                Suscribirse
              </a>
            </div>
          </form>
        </div>
      </div>
      <!-- End Grid -->

      <div class="mt-5 sm:mt-12 grid gap-y-2 sm:gap-y-0 sm:flex sm:justify-between sm:items-center">
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-400">© 2024 <span class="text-[#CF33D1]">Coral</span><span class="text-[#929292]">Gris</span>. Todos los derechos reservados.</p>
        </div>

        <!-- Social Brands -->
        <div class="mr-16">
          <a class="size-10 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-white hover:bg-[#82FFFF] hover:text-gray-900 transition-colors duration-300" href="#">
            <svg class="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
            </svg>
          </a>
          <a class="size-10 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-white hover:bg-[#82FFFF] hover:text-gray-900 transition-colors duration-300" href="#">
            <svg class="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
            </svg>
          </a>
          <a class="size-10 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-white hover:bg-[#82FFFF] hover:text-gray-900 transition-colors duration-300" href="#">
            <svg class="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { onMounted } from 'vue'
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Spirax&display=swap');

.font-spirax {
  font-family: 'Spirax', cursive;
}
</style>
