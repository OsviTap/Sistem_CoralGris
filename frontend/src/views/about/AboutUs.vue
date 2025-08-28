<script setup>
import Navbar from '@/components/landing/Navbar.vue'
import Footer from '@/components/landing/Footer.vue'
import { sucursales } from '@/data/sucursales'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navbar -->
    <Navbar />

    <!-- Contenido principal -->
    <main class="flex-grow">
      <div class="bg-gray-50 dark:bg-gray-900">
        <!-- Hero Section -->
        <div class="relative overflow-hidden bg-white dark:bg-gray-800">
          <div class="max-w-7xl mx-auto">
            <div class="relative z-10 pb-8 bg-white dark:bg-gray-800 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
              <div class="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div class="text-center lg:text-left">
                  <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                    <span class="block">Librería Coral Gris</span>
                    <span class="block text-[#33c7d1] xl:inline">Tu socio en educación y oficina</span>
                  </h1>
                  <p class="mt-3 text-base text-gray-500 dark:text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Somos una empresa importadora y distribuidora líder en material escolar y de oficina. Con más de X años de experiencia, contamos con 5 sucursales estratégicamente ubicadas para servirte mejor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección Nosotros -->
        <div class="py-16 bg-white dark:bg-gray-800">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="lg:text-center">
              <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Nuestra Historia
              </h2>
              <p class="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
                Desde nuestros inicios, nos hemos dedicado a proporcionar productos de calidad y un servicio excepcional a nuestros clientes.
              </p>
            </div>
          </div>
        </div>

        <!-- Sección Sucursales -->
        <div class="py-16">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-12">
              Nuestras Sucursales
            </h2>
            
            <div class="space-y-12">
              <div v-for="sucursal in sucursales" 
                   :key="sucursal.id"
                   class="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-transform hover:scale-[1.02]">
                <div class="lg:flex">
                  <div class="lg:w-1/2">
                    <img :src="sucursal.imagen" 
                         :alt="sucursal.nombre"
                         class="h-64 w-full object-cover lg:h-full">
                  </div>
                  <div class="lg:w-1/2 p-8">
                    <div class="uppercase tracking-wide text-sm text-[#33c7d1] font-semibold">
                      {{ sucursal.nombre }}
                    </div>
                    <p class="mt-2 text-gray-500 dark:text-gray-300">
                      {{ sucursal.descripcion }}
                    </p>
                    <div class="mt-4 space-y-4">
                      <div class="flex items-center text-gray-600 dark:text-gray-300">
                        <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        {{ sucursal.direccion }}
                      </div>
                      <div class="flex items-center text-gray-600 dark:text-gray-300">
                        <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {{ sucursal.horario }}
                      </div>
                      <div class="flex items-center space-x-4">
                        <a :href="sucursal.mapsUrl" 
                           target="_blank"
                           class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#33c7d1] hover:bg-[#2ba1a9] transition-colors">
                          <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                          </svg>
                          Ver en Maps
                        </a>
                        <a :href="`https://wa.me/${sucursal.telefono}`" 
                           target="_blank"
                           class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[#33c7d1] bg-[#33c7d1]/10 hover:bg-[#33c7d1]/20 transition-colors">
                          <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.89-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                          </svg>
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<style scoped>
/* Añadir transiciones suaves */
.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style> 