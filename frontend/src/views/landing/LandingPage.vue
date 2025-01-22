<template>
  <div class="w-full min-h-screen flex flex-col">
    <Navbar />
    
    <main class="w-full flex-grow">
      <!-- Hero Section -->
      <MainCarousel />
      
      <!-- Resto del contenido -->
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Aquí irá el resto del contenido -->
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import Navbar from '@/components/landing/Navbar.vue'
import Footer from '@/components/landing/Footer.vue'
import MainCarousel from '@/components/landing/MainCarousel.vue'
</script>
