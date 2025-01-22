<template>
  <div class="w-full min-h-screen flex flex-col">
    <Navbar />
    
    <main class="w-full flex-grow">
      <!-- Hero Section -->
      <MainCarousel />
      
      <!-- Título principal -->
      <div class="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-6">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-800">
          Tienda en línea. 
          <span class="text-[#33c7d1]">Tenemos en selección los mejores productos para ti.</span>
        </h1>
      </div>

      <!-- Categorías -->
      <CategoryCards />

      <!-- Título de subcategorías -->
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-800">
          Explora todos nuestros productos.
        </h1>
      </div>

      <!-- Subcategorías -->
      <SubcategoryCards />
    </main>

    <Footer />
  </div>
</template>

<script setup>
import Navbar from '@/components/landing/Navbar.vue'
import Footer from '@/components/landing/Footer.vue'
import MainCarousel from '@/components/landing/MainCarousel.vue'
import CategoryCards from '@/components/landing/CategoryCards.vue'
import SubcategoryCards from '@/components/landing/SubcategoryCards.vue'
</script>
