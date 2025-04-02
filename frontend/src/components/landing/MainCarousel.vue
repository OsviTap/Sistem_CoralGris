<script setup>
import { onMounted } from 'vue'
import { useContenidoLandingStore } from '@/stores/contenidoLanding'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const contenidoStore = useContenidoLandingStore()

const handleImageError = (e) => {
  e.target.src = '/images/placeholder.jpg' // Asegúrate de tener una imagen de respaldo
}

onMounted(async () => {
  await contenidoStore.fetchCarruselContent()
})
</script>

<template>
  <div class="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
    <!-- Loading State -->
    <div v-if="contenidoStore.loading" 
         class="w-full h-[350px] bg-gray-200 animate-pulse flex items-center justify-center rounded-lg">
      <span class="text-gray-500">Cargando carrusel...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="contenidoStore.error" 
         class="w-full h-[350px] bg-red-100 flex items-center justify-center rounded-lg">
      <span class="text-red-500">{{ contenidoStore.error }}</span>
    </div>

    <!-- No Content State -->
    <div v-else-if="!contenidoStore.carruselItems.length" 
         class="w-full h-[350px] bg-gray-100 flex items-center justify-center rounded-lg">
      <span class="text-gray-500">No hay contenido para mostrar</span>
    </div>

    <!-- Carrusel -->
    <swiper v-else
      :modules="[Autoplay, Pagination, Navigation]"
      :slides-per-view="1"
      :loop="true"
      :autoplay="{
        delay: 5000,
        disableOnInteraction: false,
      }"
      :pagination="{
        clickable: true,
      }"
      :navigation="true"
      class="mySwiper h-[350px] rounded-lg shadow-xl">
      <swiper-slide v-for="item in contenidoStore.carruselItems" 
                    :key="item.id" 
                    class="relative">
        <img :src="item.imagen_url" 
             :alt="item.titulo"
             class="w-full h-full object-cover rounded-lg"
             @error="handleImageError" />
        
        <!-- Solo mostrar el div si hay título o contenido -->
        <div v-if="item.titulo || item.contenido" 
             class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-8 rounded-b-lg">
          <div class="text-white">
            <h2 v-if="item.titulo" 
                class="text-3xl font-bold mb-2">
              {{ item.titulo }}
            </h2>
            <p v-if="item.contenido" 
               class="text-lg text-center max-w-2xl mx-auto">
              {{ item.contenido }}
            </p>
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<style scoped>
.swiper {
  width: 100%;
  height: 100%;
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: white;
  background: rgba(0, 0, 0, 0.5);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

:deep(.swiper-button-next::after),
:deep(.swiper-button-prev::after) {
  font-size: 20px;
}

:deep(.swiper-pagination-bullet) {
  background: white;
  opacity: 0.7;
  transition: all 0.3s ease;
}

:deep(.swiper-pagination-bullet-active) {
  opacity: 1;
  transform: scale(1.2);
}

/* Añadir efecto de hover a los botones de navegación */
:deep(.swiper-button-next:hover),
:deep(.swiper-button-prev:hover) {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

/* Ajustar la altura del gradiente */
.bg-gradient-to-t {
  background: linear-gradient(to top, 
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 0, 0, 0) 100%
  );
  padding-top: 4rem;
}
</style> 