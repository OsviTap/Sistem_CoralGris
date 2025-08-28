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
import { sucursales } from '@/data/sucursales'

// Deshabilitar telemetría de Mapbox para evitar errores de bloqueo
if (typeof mapboxgl !== 'undefined') {
  // Interceptar la función postEvent para silenciar telemetría
  const originalPostEvent = mapboxgl.postEvent;
  if (originalPostEvent) {
    mapboxgl.postEvent = function() {
      // No hacer nada - silenciar telemetría
      return;
    };
  }
}

const router = useRouter()
const cartStore = useCartStore()
const pedidoStore = usePedidoStore()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref(null)
const map = ref(null)
const marker = ref(null)
const mapInstance = ref(null)
const ubicacionGuardada = ref(false)  // Indicador visual de ubicación guardada

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
    zoom: 12,
    tipoEntrega: 'local'
  },
  { 
    id: 'cochabamba', 
    nombre: 'Cochabamba',
    coordenadas: [-66.1568, -17.3895],
    zoom: 12,
    tipoEntrega: 'local'
  },
  {
    id: 'la-paz',
    nombre: 'La Paz',
    tipoEntrega: 'nacional'
  },
  {
    id: 'oruro',
    nombre: 'Oruro',
    tipoEntrega: 'nacional'
  },
  {
    id: 'potosi',
    nombre: 'Potosí',
    tipoEntrega: 'nacional'
  },
  {
    id: 'tarija',
    nombre: 'Tarija',
    tipoEntrega: 'nacional'
  },
  {
    id: 'chuquisaca',
    nombre: 'Chuquisaca',
    tipoEntrega: 'nacional'
  },
  {
    id: 'beni',
    nombre: 'Beni',
    tipoEntrega: 'nacional'
  },
  {
    id: 'pando',
    nombre: 'Pando',
    tipoEntrega: 'nacional'
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
  direccionGeocodificada: '', // ✅ Nueva propiedad para la dirección geocodificada

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

// Computed para determinar si es envío nacional
const isEnvioNacional = computed(() => {
  const deptoSeleccionado = departamentos.value.find(d => d.id === formData.value.departamento)
  return deptoSeleccionado?.tipoEntrega === 'nacional'
})

// Funciones del mapa
const geocodificarCoordenadas = async (lng, lat) => {
  try {
    console.log('🌍 Geocodificando coordenadas:', lng, lat);
    
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&types=address&language=es`
    );
    
    if (!response.ok) {
      throw new Error('Error en la geocodificación');
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const direccion = data.features[0].place_name_es || data.features[0].place_name;
      console.log('✅ Dirección geocodificada:', direccion);
      return direccion;
    } else {
      console.log('⚠️ No se encontró dirección para las coordenadas');
      return null;
    }
  } catch (error) {
    console.error('❌ Error en geocodificación:', error);
    return null;
  }
};

const handleMapClick = async (e) => {
  const { lng, lat } = e.lngLat;
  formData.value.coordenadas = { lng, lat };
  createMarker({ lng, lat });
  ubicacionGuardada.value = false;  // ✅ Resetear indicador al hacer nuevo clic
  
  // ✅ Geocodificar las coordenadas
  const direccion = await geocodificarCoordenadas(lng, lat);
  if (direccion) {
    formData.value.direccionGeocodificada = direccion;
    // ✅ Auto-completar el campo de dirección si está vacío
    if (!formData.value.direccion_entrega) {
      formData.value.direccion_entrega = direccion;
    }
  }
  
  mostrarAlerta('Ubicación seleccionada correctamente', 'success');
};

const createMarker = (coords) => {
  console.log('🔍 Creando marcador con coordenadas:', coords);
  
  if (marker.value) {
    console.log('🗑️ Removiendo marcador anterior');
    marker.value.remove();
  }

  // ✅ Usar marcador por defecto de Mapbox con configuración optimizada
  marker.value = new mapboxgl.Marker({
    color: '#CF33D1',  // Color morado
    draggable: true,   // Arrastrable
    scale: 1.5         // Escala moderada para visibilidad
  })
    .setLngLat([coords.lng, coords.lat])
    .addTo(mapInstance.value);

  console.log('✅ Marcador creado:', marker.value);
  console.log('📍 Posición del marcador:', marker.value.getLngLat());

  // ✅ Verificar que el marcador se agregó correctamente
  setTimeout(() => {
    const markerElement = document.querySelector('.mapboxgl-marker');
    if (markerElement) {
      console.log('✅ Elemento del marcador encontrado en el DOM:', markerElement);
      console.log('✅ Estilos del marcador:', markerElement.style);
    } else {
      console.log('❌ No se encontró el elemento del marcador en el DOM');
    }
  }, 100);

  // ✅ Manejar eventos del marcador
  marker.value.on('dragend', async (e) => {
    const { lng, lat } = e.target.getLngLat();
    formData.value.coordenadas = { lng, lat };
    ubicacionGuardada.value = false;  // ✅ Resetear indicador al arrastrar
    
    // ✅ Geocodificar las nuevas coordenadas
    const direccion = await geocodificarCoordenadas(lng, lat);
    if (direccion) {
      formData.value.direccionGeocodificada = direccion;
    }
    
    mostrarAlerta('Ubicación actualizada', 'success');
  });
};

const initMap = () => {
  console.log('🗺️ Inicializando mapa...');
  if (!formData.value.departamento) {
    console.log('❌ No hay departamento seleccionado');
    return;
  }
  
  nextTick(() => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.log('❌ No se encontró el contenedor del mapa');
      return;
    }

    console.log('✅ Contenedor del mapa encontrado');

    // Destruir mapa existente
    if (mapInstance.value) {
      console.log('🗑️ Destruyendo mapa existente');
      mapInstance.value.remove();
      marker.value = null;
    }

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    console.log('🔑 Token de Mapbox configurado');
    
    const departamento = departamentos.value.find(d => d.id === formData.value.departamento);
    console.log('📍 Departamento seleccionado:', departamento);

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

    console.log('🗺️ Mapa creado:', mapInstance.value);

    // ✅ Esperar a que el mapa se cargue completamente
    mapInstance.value.on('load', () => {
      console.log('✅ Mapa cargado completamente');
      
      // ❌ NO crear marcador automáticamente - esperar a que el usuario haga clic
      // createMarker(departamento.coordenadas);
      
      // ✅ Conectar clics del mapa DESPUÉS de crear el marcador
      mapInstance.value.on('click', (e) => {
        console.log('🖱️ Clic en el mapa:', e.lngLat);
        // ✅ Evitar clic en el marcador
        if (e.originalEvent.target.closest('.mapboxgl-marker')) {
          console.log('❌ Clic en marcador, ignorando');
          return;
        }
        
        const { lng, lat } = e.lngLat;
        formData.value.coordenadas = { lng, lat };
        createMarker({ lng, lat });
        ubicacionGuardada.value = false;
        mostrarAlerta('Ubicación seleccionada correctamente', 'success');
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

const sucursalesPorDepartamento = computed(() => {
  if (!formData.value.departamento) return []
  
  return sucursales.filter(sucursal => {
    const departamento = formData.value.departamento.toLowerCase()
    const nombreSucursal = sucursal.nombre.toLowerCase()
    const direccionSucursal = sucursal.direccion.toLowerCase()
    
    if (departamento === 'santa-cruz') {
      return nombreSucursal.includes('santa cruz') || direccionSucursal.includes('santa cruz')
    }
    
    if (departamento === 'cochabamba') {
      return nombreSucursal.includes('cochabamba') || 
             nombreSucursal.includes('quillacollo') ||
             direccionSucursal.includes('cochabamba') ||
             direccionSucursal.includes('quillacollo')
    }
    
    return false
  })
})

const cambiarUbicacionMapa = () => {
  if (!formData.value.departamento) return;
  
  // Limpiar coordenadas anteriores
  formData.value.coordenadas = null;
  ubicacionGuardada.value = false;  // ✅ Resetear indicador visual
  
  // Reiniciar el mapa
  initMap();
};

const guardarUbicacion = () => {
  if (!mapInstance.value || !marker.value) return;
  
  // ✅ Usar posición del marcador, no del centro del mapa
  const markerPosition = marker.value.getLngLat();
  formData.value.coordenadas = {
    lng: markerPosition.lng,
    lat: markerPosition.lat
  };
  ubicacionGuardada.value = true;  // ✅ Indicador visual
  mostrarAlerta('¡Ubicación guardada correctamente!', 'success');
};

// Watchers y lifecycle hooks
watch(() => formData.value.departamento, (newVal) => {
  if (newVal) {
    const deptoSeleccionado = departamentos.value.find(d => d.id === newVal);
    if (deptoSeleccionado?.tipoEntrega === 'nacional') {
      formData.value.tipo_entrega = 'nacional';
      if (formData.value.tipo_pago === 'efectivo') {
        formData.value.tipo_pago = 'qr';
      }
    }
    if (!isEnvioNacional.value) {
      initMap();
    }
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
                  <!-- Selección de departamento -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Departamento
                    </label>
                    <select 
                      v-model="formData.departamento"
                      class="w-full border-gray-300 rounded-md shadow-sm"
                      @change="cambiarUbicacionMapa"
                    >
                      <option value="">Seleccione un departamento</option>
                      <template v-for="depto in departamentos" :key="depto.id"> 
                        <option :value="depto.id">{{ depto.nombre }}</option>
                      </template>
                    </select>
                  </div>

                  <!-- Aviso para envíos nacionales -->
                  <div v-if="isEnvioNacional" class="bg-blue-50 p-4 rounded-lg">
                    <div class="flex">
                      <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div class="ml-3">
                        <h3 class="text-sm font-medium text-blue-800">
                          Información importante sobre envíos nacionales
                        </h3>
                        <div class="mt-2 text-sm text-blue-700">
                          <ul class="list-disc pl-5 space-y-1">
                            <li>El envío se realizará mediante transportadora</li>
                            <li>Plazo de envío: 48 horas hábiles después de confirmar el pago</li>
                            <li>Se le enviará la guía de envío por WhatsApp</li>
                            <li>Disponible solo pago por QR o transferencia bancaria</li>
                            <li>Se le contactará para coordinar los detalles del envío</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Opciones de entrega solo para envíos locales -->
                  <div v-if="!isEnvioNacional">
                    <!-- Aquí va el código existente de las opciones de entrega local -->
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de entrega
                        </label>
                        <div class="space-y-2">
                          <div v-if="!isEnvioNacional" class="flex items-center">
                            <input type="radio" v-model="formData.tipo_entrega" value="delivery" id="delivery" class="text-[#33c7d1]">
                            <label for="delivery" class="ml-2">Delivery a domicilio</label>
                          </div>
                          <div v-if="!isEnvioNacional" class="flex items-center">
                            <input type="radio" v-model="formData.tipo_entrega" value="sucursal" id="sucursal" class="text-[#33c7d1]">
                            <label for="sucursal" class="ml-2">Recoger en sucursal</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Dirección y mapa (si es delivery) -->
              <div v-if="formData.tipo_entrega === 'delivery'" class="space-y-4 mb-6">
                <!-- Aviso de disponibilidad -->
                <div class="bg-blue-50 p-4 rounded-md text-blue-700 mb-4">
                  <p class="text-sm">
                    Por el momento, el servicio de delivery solo está disponible en Santa Cruz y Cochabamba.
                  </p>
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
                  
                  <!-- Instrucciones para usuarios -->
                  <div class="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div class="flex items-start gap-3">
                      <div class="flex-shrink-0 mt-1">
                        <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <h4 class="text-sm font-medium text-blue-800 mb-2">
                          📍 ¿Cómo seleccionar tu ubicación?
                        </h4>
                        <div class="text-sm text-blue-700 space-y-2">
                          <div class="flex items-center gap-2">
                            <span class="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                            <span><strong>Toca</strong> cualquier punto del mapa para colocar el marcador</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <span class="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                            <span><strong>Arrastra</strong> el marcador morado para ajustar la posición</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <span class="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                            <span><strong>Presiona</strong> "Guardar Ubicación" para confirmar</span>
                          </div>
                          <div class="mt-3 p-2 bg-blue-100 rounded text-xs">
                            💡 <strong>Consejo:</strong> Acerca el mapa (zoom) para seleccionar con más precisión
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Mensaje de instrucción -->
                  <div v-if="!formData.coordenadas" class="mb-2 p-3 bg-blue-50 rounded-lg">
                    <p class="text-sm text-blue-700">
                      💡 <strong>Haz clic en el mapa</strong> para seleccionar tu ubicación de entrega
                    </p>
                  </div>
                  
                  <div id="map" class="w-full h-96 rounded-lg border-2 border-gray-200"></div>
                  
                  <!-- Indicador de coordenadas -->
                  <div v-if="formData.coordenadas" class="mt-2 p-3 bg-blue-50 rounded-lg">
                    <div class="space-y-2">
                      <div class="flex items-center gap-2">
                        <span class="text-blue-600">📍</span>
                        <span class="text-sm font-medium text-blue-800">Coordenadas seleccionadas:</span>
                      </div>
                      <div class="text-sm text-blue-700 font-mono bg-blue-100 p-2 rounded">
                        {{ formData.coordenadas.lat.toFixed(6) }}, {{ formData.coordenadas.lng.toFixed(6) }}
                      </div>
                      
                      <!-- Dirección geocodificada -->
                      <div v-if="formData.direccionGeocodificada" class="mt-3">
                        <div class="flex items-center gap-2">
                          <span class="text-green-600">🏠</span>
                          <span class="text-sm font-medium text-green-800">Dirección detectada:</span>
                        </div>
                        <div class="text-sm text-green-700 bg-green-100 p-2 rounded mt-1">
                          {{ formData.direccionGeocodificada }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-4">
                  <button
                    @click="guardarUbicacion"
                    :class="{
                      'w-full px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2': true,
                      'bg-[#CF33D1] text-white hover:bg-opacity-90': !ubicacionGuardada,
                      'bg-green-500 text-white hover:bg-green-600': ubicacionGuardada
                    }"
                  >
                    <svg v-if="!ubicacionGuardada" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    {{ ubicacionGuardada ? 'Ubicación Guardada ✓' : 'Guardar Ubicación' }}
                  </button>
                </div>
              </div>

              <!-- Lista de sucursales -->
              <div v-if="formData.tipo_entrega === 'sucursal' && !isEnvioNacional" class="mt-4 space-y-4">
                <div 
                  v-for="sucursal in sucursalesPorDepartamento" 
                  :key="sucursal.id"
                  class="border rounded-lg p-4 hover:border-[#33c7d1] transition-colors"
                  :class="{ 'border-[#33c7d1] bg-blue-50': formData.sucursal_id === sucursal.id }"
                >
                  <div class="flex items-start gap-3">
                    <input
                      type="radio"
                      :id="'sucursal-' + sucursal.id"
                      :value="sucursal.id"
                      v-model="formData.sucursal_id"
                      class="mt-1 text-[#33c7d1]"
                    >
                    <div class="flex-1">
                      <label :for="'sucursal-' + sucursal.id" class="block font-medium">
                        {{ sucursal.nombre }}
                      </label>
                      <p class="text-sm text-gray-600 mt-1">{{ sucursal.direccion }}</p>
                      <p class="text-sm text-gray-600">{{ sucursal.horario }}</p>
                      
                      <div class="flex gap-3 mt-2">
                        <a 
                          :href="sucursal.mapsUrl" 
                          target="_blank"
                          class="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C7.802 0 4 3.403 4 7.602C4 11.8 7.469 16.812 12 24C16.531 16.812 20 11.8 20 7.602C20 3.403 16.199 0 12 0ZM12 11C10.343 11 9 9.657 9 8C9 6.343 10.343 5 12 5C13.657 5 15 6.343 15 8C15 9.657 13.657 11 12 11Z"/>
                          </svg>
                          Ver ubicación
                        </a>
                        
                        <a 
                          :href="'https://wa.me/' + sucursal.telefono.replace(/[^0-9]/g, '')"
                          target="_blank"
                          class="inline-flex items-center text-sm text-green-600 hover:text-green-800"
                        >
                          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.153 23.486l4.452-2.131A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                          </svg>
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Método de pago -->
            <div class="bg-white rounded-lg shadow p-6 mb-6">
              <h2 class="text-2xl font-bold mb-6">Método de pago</h2>
              
              <div class="space-y-4">
                <label class="block text-sm font-medium text-gray-700">
                  Método de pago
                </label>
                <div class="space-y-2">
                  <div v-if="!isEnvioNacional" class="flex items-center">
                    <input type="radio" v-model="formData.tipo_pago" value="efectivo" id="efectivo" class="text-[#33c7d1]">
                    <label for="efectivo" class="ml-2">Efectivo</label>
                  </div>
                  <div class="flex items-center">
                    <input type="radio" v-model="formData.tipo_pago" value="qr" id="qr" class="text-[#33c7d1]" :checked="isEnvioNacional">
                    <label for="qr" class="ml-2">Pago QR</label>
                  </div>
                  <div class="flex items-center">
                    <input type="radio" v-model="formData.tipo_pago" value="transferencia" id="transferencia" class="text-[#33c7d1]">
                    <label for="transferencia" class="ml-2">Transferencia bancaria</label>
                  </div>
                </div>

                <!-- Aviso adicional para envíos nacionales -->
                <div v-if="isEnvioNacional && ['qr', 'transferencia'].includes(formData.tipo_pago)" class="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <p class="text-sm text-yellow-700">
                    Una vez realizado el pago, por favor envíe el comprobante. El pedido será procesado y enviado después de confirmar el pago.
                  </p>
                </div>
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
          <div class="w-full md:w-96">
            <div class="bg-white rounded-lg shadow p-6" :style="{ top: '80px' }" style="position: sticky;">
              <h3 class="text-lg font-medium mb-4">Resumen del pedido</h3>
              
              <!-- Lista de productos -->
              <div class="space-y-4 mb-6 max-h-[50vh] overflow-y-auto">
                <div 
                  v-for="item in cartStore.items" 
                  :key="item.id"
                  class="flex gap-3 py-3 border-b last:border-b-0"
                >
                  <img 
                    :src="item.imagen_url" 
                    :alt="item.nombre"
                    class="w-16 h-16 object-cover rounded"
                  />
                  <div class="flex-1">
                    <h4 class="text-sm font-medium line-clamp-2">{{ item.nombre }}</h4>
                    <div class="flex items-center gap-2 mt-2">
                      <div class="flex items-center gap-1">
                        <button 
                          @click="cartStore.updateQuantity(item.id, Math.max(1, item.cantidad - 1))"
                          class="p-1 text-sm border rounded hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span class="w-8 text-center text-sm">{{ item.cantidad }}</span>
                        <button 
                          @click="cartStore.updateQuantity(item.id, item.cantidad + 1)"
                          class="p-1 text-sm border rounded hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      <span class="text-sm font-medium ml-auto">{{ formatPrice(item.precio * item.cantidad) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Subtotal y botones -->
              <div class="border-t pt-4 space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Subtotal</span>
                  <span class="font-medium">{{ formatPrice(cartStore.subtotal) }}</span>
                </div>
                
                <div class="space-y-3">
                  <button
                    @click="enviarPedido"
                    class="w-full bg-[#33c7d1] text-white py-3 px-4 rounded-lg hover:bg-[#2ba3ac] transition-colors"
                  >
                    Finalizar pedido
                  </button>

                  <button
                    @click="router.push('/productos')"
                    class="w-full bg-white text-[#33c7d1] border-2 border-[#33c7d1] py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Seguir comprando
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
  z-index: 9999 !important;
  pointer-events: auto !important;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4)) !important;
}

.mapboxgl-marker svg {
  width: 30px !important;
  height: 45px !important;
  cursor: grab !important;
  transition: transform 0.2s ease !important;
}

.mapboxgl-marker:hover svg {
  transform: scale(1.1) !important;
}

.mapboxgl-marker:active svg {
  cursor: grabbing !important;
  transform: scale(0.95) !important;
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