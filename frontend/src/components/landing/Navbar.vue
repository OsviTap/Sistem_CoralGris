<template>
    <header class="flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full bg-white text-sm py-4 dark:bg-gray-800">
      <nav class="max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
        <div class="flex items-center justify-between">
        <a class="flex-none text-xl font-semibold dark:text-white focus:outline-none focus:opacity-80" href="#" aria-label="Brand">
            <span class="inline-flex items-center gap-x-2 text-xl font-semibold dark:text-white">
            <img class="w-10 h-auto" src="../assets/img/logo/logo-short.png" alt="Logo">
            Brand
            </span>
        </a>
        <div class="sm:hidden">
            <button type="button" 
                    class="hs-collapse-toggle size-8 flex justify-center items-center text-sm font-semibold rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                    data-hs-collapse="#navbar-collapse-with-animation"
                    aria-controls="navbar-collapse-with-animation"
                    aria-label="Toggle navigation">
                <svg class="hs-collapse-open:hidden flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
                <svg class="hs-collapse-open:block hidden flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
        </div>
        </div>
        <div id="navbar-collapse-with-animation" class="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow sm:block">
        <div class="flex flex-col gap-5 mt-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:ps-5">
          <div class="hs-dropdown [--strategy:static] sm:[--strategy:absolute] [--adaptive:none] sm:[--trigger:hover] [--placement:bottom-left]">
            <button id="hs-mega-menu-basic-dr" type="button" class="hs-dropdown-toggle sm:p-2 inline-flex justify-center items-center gap-2 rounded-md font-medium text-gray-600 hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-500" aria-expanded="false">
              Categoria
              <svg class="hs-dropdown-open:rotate-180 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            <div class="hs-dropdown-menu transition-[opacity,margin] duration-[0.1ms] sm:duration-[150ms] hs-dropdown-open:opacity-100 opacity-0 w-full sm:w-[750px] z-10 sm:mt-2 bg-white sm:shadow-md rounded-lg p-4 dark:bg-gray-800 sm:dark:border dark:border-gray-700 hidden sm:absolute sm:left-1/2 sm:-translate-x-1/2">
              <div class="sm:grid sm:grid-cols-5 sm:gap-6">
                <!-- Escolares -->
                <div class="col-span-1">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Escolares</h3>
                  <div class="mt-2 border-t border-gray-200 dark:border-gray-600"></div>
                  <ul class="mt-4 space-y-3">
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Cuadernos</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Mochilas</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Lapiceros</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Loncheras</a></li>
                  </ul>
                </div>

                <!-- Oficina -->
                <div class="col-span-1">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Oficina</h3>
                  <div class="mt-2 border-t border-gray-200 dark:border-gray-600"></div>
                  <ul class="mt-4 space-y-3">
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Archivadores</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Papel Bond</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Folders</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Agendas</a></li>
                  </ul>
                </div>

                <!-- Artístico -->
                <div class="col-span-1">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Artístico</h3>
                  <div class="mt-2 border-t border-gray-200 dark:border-gray-600"></div>
                  <ul class="mt-4 space-y-3">
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Pinturas</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Pinceles</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Lienzos</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Marcadores</a></li>
                  </ul>
                </div>

                <!-- Regalos -->
                <div class="col-span-1">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Regalos</h3>
                  <div class="mt-2 border-t border-gray-200 dark:border-gray-600"></div>
                  <ul class="mt-4 space-y-3">
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Peluches</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Tarjetas</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Globos</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Tazas</a></li>
                  </ul>
                </div>

                <!-- Robótica -->
                <div class="col-span-1">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Robótica</h3>
                  <div class="mt-2 border-t border-gray-200 dark:border-gray-600"></div>
                  <ul class="mt-4 space-y-3">
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Arduino</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Sensores</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Motores</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Kits</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Nuevo Dropdown Marcas -->
          <div class="hs-dropdown [--strategy:static] sm:[--strategy:absolute] [--adaptive:none] sm:[--trigger:hover] [--placement:bottom-left]">
            <button type="button" class="hs-dropdown-toggle sm:p-2 inline-flex justify-center items-center gap-2 rounded-md font-medium text-gray-600 hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-500">
              Marcas
              <svg class="hs-dropdown-open:rotate-180 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            <div class="hs-dropdown-menu transition-[opacity,margin] duration-[0.1ms] sm:duration-[150ms] hs-dropdown-open:opacity-100 opacity-0 w-full sm:w-[600px] z-10 sm:mt-2 bg-white sm:shadow-md rounded-lg p-4 dark:bg-gray-800 sm:dark:border dark:border-gray-700 hidden sm:absolute sm:left-1/2 sm:-translate-x-1/2">
              <div class="sm:grid sm:grid-cols-4 sm:gap-6">
                <!-- A-C -->
                <div class="col-span-1">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-white">A-C</h3>
                  <div class="mt-2 border-t border-gray-200 dark:border-gray-600"></div>
                  <ul class="mt-4 space-y-3">
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Artesco</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Bic</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Crayola</a></li>
                  </ul>
                </div>

                <!-- D-L -->
                <div class="col-span-1">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-white">D-L</h3>
                  <div class="mt-2 border-t border-gray-200 dark:border-gray-600"></div>
                  <ul class="mt-4 space-y-3">
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">David</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Faber Castell</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Layconsa</a></li>
                  </ul>
                </div>

                <!-- M-P -->
                <div class="col-span-1">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-white">M-P</h3>
                  <div class="mt-2 border-t border-gray-200 dark:border-gray-600"></div>
                  <ul class="mt-4 space-y-3">
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Maped</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Pilot</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Paper Mate</a></li>
                  </ul>
                </div>

                <!-- R-Z -->
                <div class="col-span-1">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-white">R-Z</h3>
                  <div class="mt-2 border-t border-gray-200 dark:border-gray-600"></div>
                  <ul class="mt-4 space-y-3">
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Stabilo</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Vinifan</a></li>
                    <li><a class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" href="#">Zebra</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Otros enlaces del menú -->
          
          <a class="font-medium text-gray-600 hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-500" href="#">Contacto</a>
          <a class="font-medium text-gray-600 hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-500" href="#">Registra tu empresa o negocio</a>
        </div>
        </div>
      </nav>
    </header>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // Configurar el comportamiento del dropdown
  const HSDropdown = window.HSDropdown;
  const HSCollapse = window.HSCollapse;
  
  if (HSDropdown) {
    HSDropdown.autoInit();
    
    // Configurar el hover para los dropdowns
    const dropdowns = document.querySelectorAll('.hs-dropdown');
    dropdowns.forEach(dropdown => {
      dropdown.addEventListener('mouseenter', () => {
        const button = dropdown.querySelector('.hs-dropdown-toggle');
        const menu = dropdown.querySelector('.hs-dropdown-menu');
        if (button && menu) {
          button.setAttribute('aria-expanded', 'true');
          menu.classList.remove('hidden');
          menu.classList.add('block');
        }
      });

      dropdown.addEventListener('mouseleave', () => {
        const button = dropdown.querySelector('.hs-dropdown-toggle');
        const menu = dropdown.querySelector('.hs-dropdown-menu');
        if (button && menu) {
          button.setAttribute('aria-expanded', 'false');
          menu.classList.add('hidden');
          menu.classList.remove('block');
        }
      });
    });
  }

  // Inicializar el menú hamburguesa
  if (HSCollapse) {
    HSCollapse.autoInit();
  }
})
</script>