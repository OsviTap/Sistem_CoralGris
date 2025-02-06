<script setup>
import { ref, onMounted, computed, nextTick, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { usePedidoStore } from '@/stores/pedido'
import { useAuthStore } from '@/stores/auth'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import Navbar from '@/components/landing/Navbar.vue'
import Footer from '@/components/landing/Footer.vue'

const router = useRouter()
const cartStore = useCartStore()
const pedidoStore = usePedidoStore()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref(null)
const map = ref(null)
const marker = ref(null)
const mapInstance = ref(null)

const alerta = ref({
  mensaje: '',
  tipo: '',
  visible: false
});

const mostrarAlerta = (mensaje, tipo = 'info') => {
  alerta.value = {
    mensaje,
    tipo,
    visible: true
  };
  setTimeout(() => {
    alerta.value.visible = false;
  }, 3000);
};

const departamentos = ref([
  { 
    id: 'santa-cruz', 
    nombre: 'Santa Cruz',
    coordenadas: [-63.1887, -17.7833],
    zoom: 12
  },
  { 
    id: 'cochabamba', 
    nombre: 'Cochabamba',
    coordenadas: [-66.1568, -17.3895],
    zoom: 12
  }
])

const formData = ref({
  // Datos personales
  nombre: authStore.user?.nombre || '',
  apellidos: '',
  telefono: authStore.user?.telefono || '',
  email: authStore.user?.email || '',

  // Datos de entrega
  tipo_entrega: 'delivery',
  sucursal_id: null,
  direccion_entrega: '',
  referencias: '',
  coordenadas: null,

  // Datos de pago
  tipo_pago: 'efectivo',
  comprobantePago: null,

  // Datos de facturación
  requiere_factura: false,
  razon_social: '',
  nit: '',

  notas: '',

  departamento: '',
})

// Computed properties
const total = computed(() => cartStore.total)
const isDelivery = computed(() => formData.value.tipo_entrega === 'delivery')
const requiereComprobante = computed(() => 
  ['transferencia', 'qr'].includes(formData.value.tipo_pago)
)

// Funciones del mapa
const handleMapClick = (e) => {
  const { lng, lat } = e.lngLat;
  formData.value.coordenadas = { lng, lat };
  createMarker({ lng, lat });
  mostrarAlerta('Ubicación seleccionada correctamente', 'success');
};

const createMarker = (coords) => {
  if (marker.value) {
    marker.value.remove();
  }

  marker.value = new mapboxgl.Marker({
    draggable: true,
    color: '#CF33D1',
    scale: Math.max(0.5, Math.min(1.5, mapInstance.value.getZoom() / 12))
  })
    .setLngLat([coords.lng, coords.lat])
    .addTo(mapInstance.value);

  // Manejar eventos del marcador
  marker.value.on('dragend', (e) => {
    const { lng, lat } = e.target.getLngLat();
    formData.value.coordenadas = { lng, lat };
    mostrarAlerta('Ubicación actualizada', 'success');
  });

  // Actualizar escala al hacer zoom
  mapInstance.value.on('zoom', () => {
    const scale = Math.max(0.5, Math.min(1.5, mapInstance.value.getZoom() / 12));
    marker.value.setScale(scale);
  });
};

const initMap = () => {
  if (!formData.value.departamento) return;
  
  nextTick(() => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Destruir mapa existente
    if (mapInstance.value) {
      mapInstance.value.remove();
      marker.value = null;
    }

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    const departamento = departamentos.value.find(d => d.id === formData.value.departamento);

    // Asegurarse que el contenedor del mapa tenga position relative
    mapContainer.style.position = 'relative';
    mapContainer.style.overflow = 'hidden';

    mapInstance.value = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: departamento.coordenadas,
      zoom: departamento.zoom,
      maxBounds: [
        [-69.0, -23.0],
        [-57.0, -9.0]
      ]
    });

    // Esperar a que el mapa se cargue completamente
    mapInstance.value.on('load', () => {
      // Crear marcador
      marker.value = new mapboxgl.Marker({
        color: '#CF33D1',
        draggable: false
      })
        .setLngLat(departamento.coordenadas)
        .addTo(mapInstance.value);

      // Actualizar posición del marcador al mover el mapa
      mapInstance.value.on('move', () => {
        marker.value.setLngLat(mapInstance.value.getCenter());
      });
    });
  });
};

const handleFileUpload = (event) => {
  formData.value.comprobantePago = event.target.files[0]
}

const validarFormulario = () => {
  const camposRequeridos = {
    nombre: 'Nombre',
    apellidos: 'Apellidos',
    telefono: 'Teléfono',
    email: 'Email'
  };

  for (const [campo, nombre] of Object.entries(camposRequeridos)) {
    if (!formData.value[campo]) {
      mostrarAlerta(`El campo ${nombre} es requerido`, 'error');
      return false;
    }
  }

  if (isDelivery.value) {
    if (!formData.value.departamento) {
      mostrarAlerta('Por favor seleccione un departamento', 'error');
      return false;
    }
    if (!formData.value.direccion_entrega) {
      mostrarAlerta('Por favor ingrese la dirección de entrega', 'error');
      return false;
    }
    if (!formData.value.coordenadas) {
      mostrarAlerta('Por favor seleccione un punto en el mapa', 'error');
      return false;
    }
  } else if (!formData.value.sucursal_id) {
    mostrarAlerta('Por favor seleccione una sucursal', 'error');
    return false;
  }

  if (formData.value.requiere_factura) {
    if (!formData.value.razon_social || !formData.value.nit) {
      mostrarAlerta('Complete los datos de facturación', 'error');
      return false;
    }
  }

  if (requiereComprobante.value && !formData.value.comprobantePago) {
    mostrarAlerta('Por favor adjunte el comprobante de pago', 'error');
    return false;
  }

  return true;
}

const enviarPedido = async () => {
  if (!validarFormulario()) return;

  loading.value = true;
  error.value = null;

  try {
    const datosPedido = {
      ...formData.value,
      productos: cartStore.items.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad
      }))
    };

    await pedidoStore.crearPedido(datosPedido);
    mostrarAlerta('¡Pedido realizado con éxito!', 'success');
    
    cartStore.clearCart();
    router.push('/pedido-confirmado');
  } catch (err) {
    mostrarAlerta(err.response?.data?.message || 'Error al procesar el pedido', 'error');
    console.error('Error:', err);
  } finally {
    loading.value = false;
  }
};

const abrirWhatsapp = () => {
  const numero = '+59172220599'
  const mensaje = 'Hola, adjunto comprobante de pago de mi pedido.'
  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, '_blank')
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(price)
}

const sucursales = ref([
  { id: 1, nombre: 'Sucursal Centro', ciudad: 'Santa Cruz' },
  { id: 2, nombre: 'Sucursal Norte', ciudad: 'Santa Cruz' },
  { id: 3, nombre: 'Sucursal Sur', ciudad: 'Cochabamba' }
])

const cambiarUbicacionMapa = () => {
  if (!formData.value.departamento) return;
  
  // Limpiar coordenadas anteriores
  formData.value.coordenadas = null;
  
  // Reiniciar el mapa
  initMap();
};

const guardarUbicacion = () => {
  if (!mapInstance.value) return;
  
  const center = mapInstance.value.getCenter();
  formData.value.coordenadas = {
    lng: center.lng,
    lat: center.lat
  };
  mostrarAlerta('¡Ubicación guardada correctamente!', 'success');
};

// Watchers y lifecycle hooks
watch(() => formData.value.departamento, (newVal) => {
  if (newVal) {
    initMap();
  }
});

onBeforeUnmount(() => {
  if (mapInstance.value) {
    mapInstance.value.remove();
  }
});

onMounted(() => {
  if (cartStore.isEmpty) {
    router.push('/cart');
    return;
  }
  // No inicializamos el mapa aquí, esperamos a que se seleccione un departamento
});
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />
    
    <div 
      v-if="alerta.visible"
      :class="{
        'fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-500': true,
        'bg-green-100 text-green-700': alerta.tipo === 'success',
        'bg-red-100 text-red-700': alerta.tipo === 'error',
        'bg-blue-100 text-blue-700': alerta.tipo === 'info'
      }"
    >
      {{ alerta.mensaje }}
    </div>
    
    <main class="flex-grow bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Formulario -->
          <div class="flex-grow">
            <div class="bg-white rounded-lg shadow p-6 mb-6">
              <h2 class="text-2xl font-bold mb-6">Datos de entrega</h2>
              
              <!-- Datos personales -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input 
                    type="text"
                    v-model="formData.nombre"
                    class="w-full border rounded-md p-2"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Apellidos
                  </label>
                  <input 
                    type="text"
                    v-model="formData.apellidos"
                    class="w-full border rounded-md p-2"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input 
                    type="tel"
                    v-model="formData.telefono"
                    class="w-full border rounded-md p-2"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input 
                    type="email"
                    v-model="formData.email"
                    class="w-full border rounded-md p-2"
                  />
                </div>
              </div>

              <!-- Método de envío -->
              <div class="mb-6">
                <h3 class="text-lg font-medium mb-4">Método de envío</h3>
                <div class="space-y-4">
                  <label class="flex items-center gap-2">
                    <input 
                      type="radio" 
                      v-model="formData.tipo_entrega"
                      value="tienda"
                    />
                    Recoger en tienda
                  </label>
                  <label class="flex items-center gap-2">
                    <input 
                      type="radio" 
                      v-model="formData.tipo_entrega"
                      value="delivery"
                    />
                    Delivery
                  </label>
                </div>
              </div>

              <!-- Sucursales (si es recoger en tienda) -->
              <div v-if="formData.tipo_entrega === 'tienda'" class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar sucursal
                </label>
                <select 
                  v-model="formData.sucursal_id"
                  class="w-full border rounded-md p-2"
                >
                  <optgroup 
                    v-for="ciudad in ['Cochabamba', 'Santa Cruz']"
                    :key="ciudad"
                    :label="ciudad"
                  >
                    <option 
                      v-for="sucursal in sucursales.filter(s => s.ciudad === ciudad)"
                      :key="sucursal.id"
                      :value="sucursal.id"
                    >
                      {{ sucursal.nombre }}
                    </option>
                  </optgroup>
                </select>
              </div>

              <!-- Dirección y mapa (si es delivery) -->
              <div v-if="formData.tipo_entrega === 'delivery'" class="space-y-4 mb-6">
                <!-- Aviso de disponibilidad -->
                <div class="bg-blue-50 p-4 rounded-md text-blue-700 mb-4">
                  <p class="text-sm">
                    Por el momento, el servicio de delivery solo está disponible en Santa Cruz y Cochabamba.
                  </p>
                </div>

                <!-- Selección de departamento -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Departamento
                  </label>
                  <select 
                    v-model="formData.departamento"
                    class="w-full border rounded-md p-2"
                    @change="cambiarUbicacionMapa"
                  >
                    <option value="">Seleccione un departamento</option>
                    <option 
                      v-for="depto in departamentos" 
                      :key="depto.id" 
                      :value="depto.id"
                    >
                      {{ depto.nombre }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <input 
                    type="text"
                    v-model="formData.direccion_entrega"
                    class="w-full border rounded-md p-2"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Referencias
                  </label>
                  <textarea 
                    v-model="formData.referencias"
                    class="w-full border rounded-md p-2"
                    rows="2"
                  ></textarea>
                </div>

                <div v-if="formData.departamento">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación en el mapa
                  </label>
                  <div id="map" class="w-full h-96 rounded-lg border-2 border-gray-200"></div>
                </div>

                <div class="mt-4">
                  <button
                    @click="guardarUbicacion"
                    class="w-full bg-[#CF33D1] text-white py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    Guardar Ubicación
                  </button>
                </div>
              </div>
            </div>

            <!-- Método de pago -->
            <div class="bg-white rounded-lg shadow p-6 mb-6">
              <h2 class="text-2xl font-bold mb-6">Método de pago</h2>
              
              <div class="space-y-4">
                <label class="flex items-center gap-2">
                  <input 
                    type="radio" 
                    v-model="formData.tipo_pago"
                    value="efectivo"
                  />
                  Efectivo al momento de la entrega
                </label>
                
                <label class="flex items-center gap-2">
                  <input 
                    type="radio" 
                    v-model="formData.tipo_pago"
                    value="transferencia"
                  />
                  Transferencia bancaria
                </label>
                
                <label class="flex items-center gap-2">
                  <input 
                    type="radio" 
                    v-model="formData.tipo_pago"
                    value="qr"
                  />
                  Pago por QR
                </label>
              </div>

              <!-- Información de pago -->
              <div 
                v-if="['transferencia', 'qr'].includes(formData.tipo_pago)"
                class="mt-4 p-4 bg-gray-50 rounded-lg"
              >
                <div v-if="formData.tipo_pago === 'transferencia'">
                  <h4 class="font-medium mb-2">Datos bancarios:</h4>
                  <p>Banco: XXX</p>
                  <p>Cuenta: XXX</p>
                  <p>Titular: XXX</p>
                </div>
                
                <div v-else>
                  <h4 class="font-medium mb-2">Escanea el código QR:</h4>
                  <img src="../../assets/images/QR.jpg" alt="QR" class="w-48 mx-auto"/>
                </div>

                <div class="mt-4">
                  <p class="text-sm text-gray-600 mb-2">
                    Por favor, envía el comprobante de pago por WhatsApp:
                  </p>
                  <button 
                    @click="abrirWhatsapp"
                    class="inline-flex items-center gap-2 text-green-600 hover:text-green-700"
                  >
                    <span>Enviar por WhatsApp</span>
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.153 23.486l4.452-2.131A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.615 0-5.026-.864-6.971-2.316l-.438-.293-3.307 1.583 1.583-3.307-.293-.438A9.958 9.958 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.778-13.889l-1.389-.389c-.188-.053-.389.063-.486.234l-.903 1.5c-.097.172-.097.389 0 .561.097.172.292.281.486.234l1.389-.389c.188-.053.389.063.486.234l.903 1.5c.097.172.097.389 0 .561-.097.172-.292.281-.486.234l-1.389-.389c-.188-.053-.389.063-.486.234l-.903 1.5c-.097.172-.097.389 0 .561.097.172.292.281.486.234l1.389-.389"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Facturación -->
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center gap-2 mb-4">
                <input 
                  type="checkbox"
                  v-model="formData.requiere_factura"
                  id="requiereFactura"
                />
                <label for="requiereFactura" class="text-lg font-medium">
                  Necesito factura
                </label>
              </div>

              <div v-if="formData.requiere_factura" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Razón Social
                  </label>
                  <input 
                    type="text"
                    v-model="formData.razon_social"
                    class="w-full border rounded-md p-2"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    NIT
                  </label>
                  <input 
                    type="text"
                    v-model="formData.nit"
                    class="w-full border rounded-md p-2"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Resumen -->
          <div class="w-full lg:w-80">
            <div class="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 class="text-lg font-medium mb-4">Resumen del pedido</h3>
              
              <div class="space-y-4">
                <div class="flex justify-between">
                  <span class="text-gray-600">Subtotal</span>
                  <span class="font-medium">{{ formatPrice(total) }}</span>
                </div>
                
                <div class="border-t pt-4">
                  <button
                    @click="enviarPedido"
                    class="w-full bg-[#33c7d1] text-white py-3 px-4 rounded-lg hover:bg-[#2ba3ac] transition-colors"
                  >
                    Finalizar pedido
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style>
#map {
  width: 100% !important;
  height: 400px !important;
  border-radius: 0.5rem;
  border: 2px solid #e5e7eb;
  position: relative !important;
  overflow: hidden !important;
}

.mapboxgl-map {
  position: absolute !important;
  top: 0 !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

.mapboxgl-marker {
  position: absolute !important;
  z-index: 1 !important;
  pointer-events: none !important;
}

.mapboxgl-canvas {
  position: absolute !important;
  left: 0 !important;
  top: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

.mapboxgl-ctrl-group {
  margin: 10px !important;
}
</style> 