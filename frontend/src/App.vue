<template>
    <div class="w-full min-h-screen">
      <RouterView class="w-full" />
      <WhatsAppButton />
    </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import WhatsAppButton from '@/components/landing/WhatsAppButton.vue'
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
}

body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
}

/* Ocultar el botón de WhatsApp en las rutas del dashboard y login */
.router-link-active[href*="dashboard"] ~ .whatsapp-button,
.router-link-active[href*="login"] ~ .whatsapp-button {
  display: none !important;
}
</style>
