<template>
    <header class="flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full bg-white text-sm py-4 dark:bg-gray-800 rounded-b-lg shadow-[0_4px_0_0_#82FFFF,0_8px_0_0_#FC30E7] relative after:content-[''] after:absolute after:left-0 after:bottom-[-9px] after:w-full after:h-[3px] after:bg-[#FC30E7] after:blur-[1px] before:content-[''] before:absolute before:left-0 before:bottom-[-5px] before:w-full before:h-[3px] before:bg-[#82FFFF] before:blur-[1px]">
      <nav class="max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
        <div class="flex items-center justify-between">
        <a class="flex-none text-2xl font-spirax" href="#">
          <span class="text-[#CF33D1]">Coral</span><span class="text-[#929292]">Gris</span>
        </a>
        <img src="../../assets/images/logo.png" alt="Logo" class="w-15 h-12 mr-2">
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
          <div class="hs-dropdown [--strategy:static] sm:[--strategy:absolute] [--adaptive:none] hidden sm:block">
            <button type="button" class="hs-dropdown-toggle sm:p-2 inline-flex justify-center items-center gap-2 rounded-md font-medium text-gray-600 hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-500">
              Categorías
              <svg class="hs-dropdown-open:rotate-180 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            <div class="hs-dropdown-menu transition-[opacity,margin] duration-[0.1ms] sm:duration-[150ms] hs-dropdown-open:opacity-100 opacity-0 w-full sm:w-[600px] md:w-[750px] lg:w-[1200px] z-10 sm:mt-2 bg-white sm:shadow-md rounded-lg p-4 dark:bg-gray-800 sm:dark:border dark:border-gray-700 hidden sm:absolute sm:left-1/2 sm:-translate-x-1/2">
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

          <!-- Categorías - Versión Móvil -->
          <div class="sm:hidden">
            <button type="button" 
                    class="hs-collapse-toggle w-full flex justify-between items-center gap-2 py-2 px-4 rounded-md font-medium text-gray-600"
                    data-hs-collapse="#categoria-collapse">
              Categorías
              <svg class="hs-collapse-open:rotate-180 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div id="categoria-collapse" class="hs-collapse hidden w-full overflow-hidden transition-[height] duration-300">
              <!-- Contenido móvil de categorías -->
              <div class="mt-2 space-y-2">
                <!-- Escolares -->
                <div>
                  <button type="button" 
                          class="hs-collapse-toggle w-full flex justify-between items-center px-4 py-2 text-gray-600"
                          data-hs-collapse="#escolares-collapse">
                    Escolares
                    <svg class="hs-collapse-open:rotate-180 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  <div id="escolares-collapse" class="hs-collapse hidden pl-4">
                    <ul class="space-y-2 py-2">
                      <li><a class="text-gray-600" href="#">Cuadernos</a></li>
                      <li><a class="text-gray-600" href="#">Mochilas</a></li>
                      <li><a class="text-gray-600" href="#">Lapiceros</a></li>
                    </ul>
                  </div>
                </div>
                <!-- Repite para otras categorías -->
              </div>
            </div>
          </div>

          <!-- Similar estructura para Marcas -->
          <div class="hs-dropdown [--strategy:static] sm:[--strategy:absolute] [--adaptive:none] hidden sm:block">
            <button type="button" class="hs-dropdown-toggle sm:p-2 inline-flex justify-center items-center gap-2 rounded-md font-medium text-gray-600 hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-500">
              Marcas
              <svg class="hs-dropdown-open:rotate-180 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            <div class="hs-dropdown-menu transition-[opacity,margin] duration-[0.1ms] sm:duration-[150ms] hs-dropdown-open:opacity-100 opacity-0 w-full sm:w-[500px] md:w-[750px] lg:w-[1200px] z-10 sm:mt-2 bg-white sm:shadow-md rounded-lg p-4 dark:bg-gray-800 sm:dark:border dark:border-gray-700 hidden sm:absolute sm:left-1/2 sm:-translate-x-1/2">
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

          <div class="sm:hidden">
            <!-- Contenido de marcas (versión móvil) -->
          </div>

          <!-- Enlaces normales -->
          
          <a class="font-medium text-gray-600 hover:text-[#CF33D1] dark:text-gray-400 dark:hover:text-[#CF33D1] px-4 py-2 rounded-full transition-all duration-300 hover:shadow-[0_0_10px_#CF33D1] hover:border hover:border-[#CF33D1]" href="#">Nosotros</a>
          <a class="font-medium text-gray-600 hover:text-[#CF33D1] dark:text-gray-400 dark:hover:text-[#CF33D1] px-4 py-2 rounded-full transition-all duration-300 hover:shadow-[0_0_10px_#CF33D1] hover:border hover:border-[#CF33D1]" href="#">Contacto</a>
          <a class="font-medium text-gray-600 hover:text-[#CF33D1] dark:text-gray-400 dark:hover:text-[#CF33D1] px-4 py-2 rounded-full transition-all duration-300 hover:shadow-[0_0_10px_#CF33D1] hover:border hover:border-[#CF33D1]" href="#">Registra tu empresa o negocio</a>
        </div>
        </div>
      </nav>
    </header>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const HSDropdown = window.HSDropdown;
  const HSCollapse = window.HSCollapse;

  if (HSDropdown) {
    HSDropdown.autoInit();
  }

  if (HSCollapse) {
    HSCollapse.autoInit();
  }

  // Manejar hover en desktop y tablets
  const handleDropdowns = () => {
    const dropdowns = document.querySelectorAll('.hs-dropdown');
    dropdowns.forEach(dropdown => {
      const button = dropdown.querySelector('.hs-dropdown-toggle');
      const menu = dropdown.querySelector('.hs-dropdown-menu');
      let isOverButton = false;
      let isOverMenu = false;

      // Evento mouseenter en el botón
      button?.addEventListener('mouseenter', () => {
        if (window.innerWidth >= 640) {
          isOverButton = true;
          updateDropdownState();
        }
      });

      // Evento mouseleave en el botón
      button?.addEventListener('mouseleave', () => {
        if (window.innerWidth >= 640) {
          isOverButton = false;
          setTimeout(updateDropdownState, 100);
        }
      });

      // Evento mouseenter en el menú
      menu?.addEventListener('mouseenter', () => {
        if (window.innerWidth >= 640) {
          isOverMenu = true;
          updateDropdownState();
        }
      });

      // Evento mouseleave en el menú
      menu?.addEventListener('mouseleave', () => {
        if (window.innerWidth >= 640) {
          isOverMenu = false;
          setTimeout(updateDropdownState, 100);
        }
      });

      // Función para actualizar el estado del dropdown
      const updateDropdownState = () => {
        if (isOverButton || isOverMenu) {
          button?.setAttribute('aria-expanded', 'true');
          menu?.classList.remove('hidden');
          menu?.classList.add('block');
          menu.style.opacity = '1';
        } else {
          button?.setAttribute('aria-expanded', 'false');
          menu?.classList.add('hidden');
          menu?.classList.remove('block');
          menu.style.opacity = '0';
        }
      };
    });
  };

  // Inicializar los dropdowns
  handleDropdowns();

  // Manejar cambios de tamaño de ventana
  window.addEventListener('resize', () => {
    handleDropdowns();
  });
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Spirax&display=swap');

.font-spirax {
  font-family: 'Spirax', cursive;
}

.hs-dropdown-menu {
  transition: opacity 0.15s ease-in-out;
}
</style>
