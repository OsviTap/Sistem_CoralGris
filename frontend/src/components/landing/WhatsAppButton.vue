<template>
  <a v-if="!isDashboardOrLogin" 
     :href="whatsappLink" 
     target="_blank" 
     rel="noopener noreferrer" 
     class="fixed bottom-8 left-8 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 z-[9998] group">
    <!-- WhatsApp Icon -->
    <svg 
      class="w-8 h-8" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="currentColor" 
      viewBox="0 0 16 16"
    >
      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
    </svg>
    
    <!-- Tooltip -->
    <span class="absolute left-[120%] top-1/2 -translate-y-1/2 hidden group-hover:block bg-gray-800 text-white text-sm py-2 px-4 rounded-lg whitespace-nowrap">
      Contáctanos por WhatsApp
      <span class="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 rotate-45 w-2 h-2 bg-gray-800"></span>
    </span>
  </a>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const phoneNumber = '51999999999' // Reemplaza con el número real
const message = 'Hola CoralGris, me gustaría obtener más información sobre sus productos.' // Mensaje predeterminado

// Verificar si estamos en una ruta del dashboard o login
const isDashboardOrLogin = computed(() => {
  return route.path.includes('/dashboard') || route.path.includes('/login')
})

const whatsappLink = computed(() => {
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
})
</script>

<style scoped>
/* Asegurarse que el botón siempre esté por encima de todo */
a {
  position: fixed !important;
  z-index: 9999 !important;
}

@media (max-width: 768px) {
  a {
    bottom: 1rem !important;
    left: 1rem !important;
  }
}
</style> 