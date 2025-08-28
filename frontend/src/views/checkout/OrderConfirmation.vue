<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/landing/Navbar.vue'
import Footer from '@/components/landing/Footer.vue'

const router = useRouter()

const volverAInicio = () => {
  router.push('/productos')
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />
    
    <main class="flex-grow bg-gray-50 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <!-- Icono de éxito -->
          <div class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-8">
            <svg class="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            ¡Pedido realizado con éxito!
          </h2>

          <p class="text-lg text-gray-600 mb-8">
            Gracias por tu compra. Te hemos enviado un correo con los detalles de tu pedido.
          </p>

          <div class="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto mb-8">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Próximos pasos:
            </h3>
            
            <ul class="space-y-4 text-left">
              <li class="flex items-start">
                <svg class="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Recibirás una confirmación por WhatsApp con los detalles de tu pedido.</span>
              </li>
              <li class="flex items-start">
                <svg class="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Si elegiste pago por transferencia o QR, no olvides enviar el comprobante por WhatsApp.</span>
              </li>
              <li class="flex items-start">
                <svg class="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Te contactaremos para coordinar la entrega o retiro de tu pedido.</span>
              </li>
            </ul>
          </div>

          <button
            @click="volverAInicio"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#33c7d1] hover:bg-[#2ba3ac]"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template> 