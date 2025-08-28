<template>
  <footer class="w-full bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 relative z-40">
    <!-- Borde superior con gradiente -->
    <div class="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#82FFFF] via-[#CF33D1] to-[#82FFFF] blur-[1px]"></div>

    <div class="w-full py-12 px-4 sm:px-6 lg:px-8 lg:pt-24 mx-auto">
      <!-- Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
        <div class="col-span-full lg:col-span-1">
          <a class="flex-none text-4xl font-spirax mb-6" href="#" aria-label="Brand">
            <span class="text-[#CF33D1]">Coral</span><span class="text-gray-700 dark:text-gray-300">Gris</span>
          </a>
          <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Tu tienda de confianza para útiles escolares y de oficina.</p>
        </div>
        <!-- End Col -->

        <div class="col-span-1">
          <h4 class="font-bold text-lg text-gray-800 dark:text-white mb-6 flex items-center gap-3">
            <div class="w-2 h-2 bg-[#CF33D1] rounded-full"></div>
            Productos
          </h4>
          <div class="grid space-y-4">
            <p><a class="inline-flex gap-x-2 text-gray-700 dark:text-gray-300 hover:text-[#CF33D1] hover:translate-x-1 transition-all duration-300 font-medium" href="#">Libros</a></p>
            <p><a class="inline-flex gap-x-2 text-gray-700 dark:text-gray-300 hover:text-[#CF33D1] hover:translate-x-1 transition-all duration-300 font-medium" href="#">Útiles</a></p>
            <p><a class="inline-flex gap-x-2 text-gray-700 dark:text-gray-300 hover:text-[#CF33D1] hover:translate-x-1 transition-all duration-300 font-medium" href="#">Ofertas</a></p>
          </div>
        </div>

        <div class="col-span-1">
          <h4 class="font-bold text-lg text-gray-800 dark:text-white mb-6 flex items-center gap-3">
            <div class="w-2 h-2 bg-[#82FFFF] rounded-full"></div>
            Empresa
          </h4>
          <div class="grid space-y-4">
            <p><a class="inline-flex gap-x-2 text-gray-700 dark:text-gray-300 hover:text-[#CF33D1] hover:translate-x-1 transition-all duration-300 font-medium" href="#">Sobre nosotros</a></p>
            <p><a class="inline-flex gap-x-2 text-gray-700 dark:text-gray-300 hover:text-[#CF33D1] hover:translate-x-1 transition-all duration-300 font-medium" href="#">Blog</a></p>
            <p><a class="inline-flex gap-x-2 text-gray-700 dark:text-gray-300 hover:text-[#CF33D1] hover:translate-x-1 transition-all duration-300 font-medium" href="#">Contacto</a></p>
          </div>
        </div>

        <div class="col-span-2">
          <h4 class="font-bold text-lg text-gray-800 dark:text-white mb-6 flex items-center gap-3">
            <div class="w-2 h-2 bg-gradient-to-r from-[#CF33D1] to-[#82FFFF] rounded-full"></div>
            Mantente informado
          </h4>
          <form>
            <div class="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:gap-3 bg-white dark:bg-gray-700 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-600">
              <div class="w-full">
                <label for="hero-input" class="sr-only">Buscar</label>
                <input type="text" id="hero-input" name="hero-input" 
                       class="py-3 px-4 block w-full rounded-lg text-sm focus:border-[#CF33D1] focus:ring-2 focus:ring-[#CF33D1] focus:ring-opacity-20 bg-gray-50 dark:bg-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-300 border border-gray-200 dark:border-gray-600 transition-all duration-300" 
                       placeholder="Ingresa tu email">
              </div>
              <a class="w-full sm:w-auto whitespace-nowrap px-6 py-3 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#CF33D1] to-[#82FFFF] text-white hover:from-[#82FFFF] hover:to-[#CF33D1] transition-all duration-300 transform hover:scale-105 shadow-lg" href="#">
                Suscribirse
              </a>
            </div>
          </form>
        </div>
      </div>
      <!-- End Grid -->

      <!-- Separador visual -->
      <div class="col-span-full border-t border-gray-200 dark:border-gray-700 my-10"></div>

      <div class="grid gap-y-4 sm:gap-y-0 sm:flex sm:justify-between sm:items-center">
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-600 dark:text-gray-300">© 2024 <span class="text-[#CF33D1] font-semibold">Coral</span><span class="text-gray-600 dark:text-gray-300">Gris</span>. Todos los derechos reservados.</p>
        </div>

                          <!-- Social Brands -->
          <div class="social-icons-mobile sm:justify-start lg:mr-16 social-icons-large relative z-50 flex justify-end">
          <a class="size-12 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#CF33D1] hover:text-[#CF33D1] hover:bg-[#CF33D1] hover:bg-opacity-10 transition-all duration-300 transform hover:scale-110" href="#">
            <svg class="flex-shrink-0 size-5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
            </svg>
          </a>
          <a class="size-12 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#CF33D1] hover:text-[#CF33D1] hover:bg-[#CF33D1] hover:bg-opacity-10 transition-all duration-300 transform hover:scale-110 ml-3" href="#">
            <svg class="flex-shrink-0 size-5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
            </svg>
          </a>
          <a class="size-12 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#CF33D1] hover:text-[#CF33D1] hover:bg-[#CF33D1] hover:bg-opacity-10 transition-all duration-300 transform hover:scale-110 ml-3" href="#">
            <svg class="flex-shrink-0 size-5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
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

/* Transiciones suaves para el cambio de tema */
footer {
  transition: all 0.4s ease;
}

/* Efectos hover mejorados para tema oscuro */
.dark footer a:hover {
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

/* Input con mejor contraste en tema oscuro */
.dark input::placeholder {
  color: #9ca3af;
}

.dark input:focus {
  background-color: #4b5563;
  border-color: #CF33D1;
  box-shadow: 0 0 0 3px rgba(207, 51, 209, 0.2);
}

/* Input con mejor contraste en tema claro */
input:focus {
  background-color: #ffffff;
  border-color: #CF33D1;
  box-shadow: 0 0 0 3px rgba(207, 51, 209, 0.1);
}

/* Efectos de hover para enlaces */
footer a:hover {
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

/* Animación para los puntos de colores */
footer h4 .w-2 {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Efecto de sombra en hover para el formulario */
footer form .bg-white:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

/* Efecto de gradiente en hover para botones sociales */
footer .size-12:hover {
  background: linear-gradient(135deg, rgba(207, 51, 209, 0.1), rgba(130, 255, 255, 0.1));
}

/* Mover iconos sociales a la izquierda SOLO en pantallas grandes */
@media (min-width: 1200px) {
  .social-icons-large {
    margin-right: 0 !important;
    margin-left: -120px !important;
    transform: translateX(-60px) !important;
    left: -120px !important;
  }
}

@media (min-width: 1400px) {
  .social-icons-large {
    margin-right: 0 !important;
    margin-left: -180px !important;
    transform: translateX(-90px) !important;
    left: -180px !important;
  }
}

@media (min-width: 1600px) {
  .social-icons-large {
    margin-right: 0 !important;
    margin-left: -240px !important;
    transform: translateX(-120px) !important;
    left: -240px !important;
  }
}

/* CSS base para iconos sociales */
.social-icons-large {
  position: relative !important;
}

/* IMPORTANTE: No aplicar estilos en pantallas pequeñas */
@media (max-width: 1199px) {
  .social-icons-large {
    margin-left: 0 !important;
    transform: none !important;
    left: 0 !important;
  }
}

/* CSS INTELIGENTE para móvil - un poco más a la izquierda */
@media (max-width: 639px) {
  .social-icons-mobile {
    justify-content: center !important;
    width: 100% !important;
    margin-left: 20px !important;
  }
}

/* CSS para pantalla mediana - un poco más a la derecha */
@media (min-width: 640px) and (max-width: 1023px) {
  .social-icons-mobile {
    justify-content: center !important;
    width: 100% !important;
    margin-right: 20px !important;
  }
}
</style>
