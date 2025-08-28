<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductoStore } from '@/stores/producto'
import { useCategoriaStore } from '@/stores/categoria'
import { useMarcaStore } from '@/stores/marca'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import CategoriaModal from '@/components/dashboard/CategoriaModal.vue'
import MarcaModal from '@/components/dashboard/MarcaModal.vue'

const route = useRoute()
const router = useRouter()
const productoStore = useProductoStore()
const categoriaStore = useCategoriaStore()
const marcaStore = useMarcaStore()

const isEditing = computed(() => !!route.params.id)
const loading = ref(false)
const saving = ref(false)
const error = ref(null)

const formData = ref({
  nombre: '',
  descripcion: '',
  codigo: '',
  tipo_codigo: 'NORMAL',
  cantidad_mayoreo: '',
  precio_l1: '',
  precio_l2: '',
  precio_l3: '',
  precio_l4: '',
  categoria_id: '',
  marca_id: '',
  imagen_url: '',
  imagenes_adicionales: [],
  agotado: false
})

const categorias = ref([])
const marcas = ref([])

const tiposCodigo = [
  { value: 'NORMAL', label: 'Código Normal' },
  { value: 'BARRA', label: 'Código de Barra' }
]

const imagenPrincipalPreview = ref('')
const imagenesAdicionalesPreview = ref([])

// Modales para categorías y marcas
const showCategoriaModal = ref(false)
const showMarcaModal = ref(false)
const categoriaSeleccionada = ref(null)
const marcaSeleccionada = ref(null)

const handleImagenPrincipal = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Limpiar la URL anterior si existe
    if (imagenPrincipalPreview.value && typeof imagenPrincipalPreview.value === 'string' && imagenPrincipalPreview.value.startsWith('blob:')) {
      URL.revokeObjectURL(imagenPrincipalPreview.value)
    }
    formData.value.imagen_url = file
    imagenPrincipalPreview.value = URL.createObjectURL(file)
  }
}

const handleImagenesAdicionales = (event) => {
  const files = Array.from(event.target.files)
  files.forEach(file => {
    formData.value.imagenes_adicionales.push(file)
    imagenesAdicionalesPreview.value.push(URL.createObjectURL(file))
  })
}

const removeImagenAdicional = (index) => {
  // Limpiar la URL del objeto
  if (imagenesAdicionalesPreview.value[index] && typeof imagenesAdicionalesPreview.value[index] === 'string' && imagenesAdicionalesPreview.value[index].startsWith('blob:')) {
    URL.revokeObjectURL(imagenesAdicionalesPreview.value[index])
  }
  formData.value.imagenes_adicionales.splice(index, 1)
  imagenesAdicionalesPreview.value.splice(index, 1)
}

// Limpiar URLs al desmontar el componente
onUnmounted(() => {
  if (imagenPrincipalPreview.value && typeof imagenPrincipalPreview.value === 'string' && imagenPrincipalPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(imagenPrincipalPreview.value)
  }
  imagenesAdicionalesPreview.value.forEach(url => {
    if (url && typeof url === 'string' && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })
})

onMounted(async () => {
  loading.value = true
  error.value = null

  try {
    console.log('ID del producto:', route.params.id)
    console.log('¿Modo edición?:', isEditing.value)

    // Cargar categorías y marcas
    const [categoriasData, marcasData] = await Promise.all([
      categoriaStore.fetchCategorias(),
      marcaStore.fetchMarcas()
    ])

    if (categoriasData) {
      categorias.value = categoriasData.map(cat => ({
        value: cat.id,
        label: cat.nombre
      }))
    }

    if (marcasData) {
      marcas.value = marcasData.map(marca => ({
        value: marca.id,
        label: marca.nombre
      }))
    }

    // Si estamos editando, cargar los datos del producto
    if (isEditing.value) {
      try {
        const producto = await productoStore.fetchProducto(route.params.id)
        console.log('Producto cargado:', producto)
        
        if (producto) {
          formData.value = {
            nombre: producto.nombre || '',
            descripcion: producto.descripcion || '',
            codigo: producto.codigo_sku || '',
            tipo_codigo: producto.codigo_sku?.includes('BARRA') ? 'BARRA' : 'NORMAL',
            cantidad_mayoreo: producto.cantidad_mayoreo || '',
            precio_l1: producto.precio_l1 || '',
            precio_l2: producto.precio_l2 || '',
            precio_l3: producto.precio_l3 || '',
            precio_l4: producto.precio_l4 || '',
            categoria_id: producto.categoria_id || '',
            marca_id: producto.marca_id || '',
            imagen_url: producto.imagen_url || '',
            imagenes_adicionales: producto.imagenes_adicionales || [],
            agotado: producto.agotado || false
          }
          
          // Establecer preview de imagen principal
          if (producto.imagen_url) {
            imagenPrincipalPreview.value = producto.imagen_url
          }
          
          // Establecer preview de imágenes adicionales
          if (producto.imagenes_adicionales) {
            imagenesAdicionalesPreview.value = producto.imagenes_adicionales
          }
        } else {
          error.value = 'No se pudo cargar el producto'
          router.push('/dashboard/productos')
        }
      } catch (error) {
        console.error('Error al cargar el producto:', error)
        error.value = 'Error al cargar el producto'
        router.push('/dashboard/productos')
      }
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    error.value = 'Error al cargar los datos necesarios'
  } finally {
    loading.value = false
  }
})

// Actualizar el código cuando cambia el tipo
watch(() => formData.value.tipo_codigo, (newValue) => {
  if (newValue === 'BARRA' && !formData.value.codigo.includes('BARRA')) {
    formData.value.codigo = 'BARRA-' + formData.value.codigo
  } else if (newValue === 'NORMAL' && formData.value.codigo.includes('BARRA-')) {
    formData.value.codigo = formData.value.codigo.replace('BARRA-', '')
  }
})

const handleSubmit = async () => {
  saving.value = true
  error.value = null

  try {
    // Preparar los datos para enviar
    const datosParaEnviar = { ...formData.value }
    
    // Asegurarnos de que el estado se envíe correctamente
    datosParaEnviar.estado = formData.value.agotado ? 'inactivo' : 'activo'
    
    if (isEditing.value) {
      await productoStore.actualizarProducto(route.params.id, datosParaEnviar)
    } else {
      await productoStore.createProducto(datosParaEnviar)
    }
    router.push('/dashboard/productos')
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al guardar el producto'
    console.error('Error en handleSubmit:', err)
  } finally {
    saving.value = false
  }
}

const eliminarImagenAdicional = (index) => {
  if (formData.value.imagenes_adicionales) {
    formData.value.imagenes_adicionales.splice(index, 1);
  }
};

// Funciones para manejar modales de categorías y marcas
const abrirCategoriaModal = () => {
  showCategoriaModal.value = true
}

const cerrarCategoriaModal = () => {
  showCategoriaModal.value = false
  categoriaSeleccionada.value = null
}

const abrirMarcaModal = () => {
  showMarcaModal.value = true
}

const cerrarMarcaModal = () => {
  showMarcaModal.value = false
  marcaSeleccionada.value = null
}

const onCategoriaSaved = async () => {
  // Recargar categorías y actualizar el select
  await categoriaStore.fetchCategorias()
  categorias.value = categoriaStore.categorias.map(cat => ({
    value: cat.id,
    label: cat.nombre
  }))
  
  // Si se creó una nueva categoría, seleccionarla automáticamente
  if (categoriaStore.categorias.length > 0) {
    const ultimaCategoria = categoriaStore.categorias[categoriaStore.categorias.length - 1]
    formData.value.categoria_id = ultimaCategoria.id
  }
}

const onMarcaSaved = async () => {
  // Recargar marcas y actualizar el select
  await marcaStore.fetchMarcas()
  marcas.value = marcaStore.marcas.map(marca => ({
    value: marca.id,
    label: marca.nombre
  }))
  
  // Si se creó una nueva marca, seleccionarla automáticamente
  if (marcaStore.marcas.length > 0) {
    const ultimaMarca = marcaStore.marcas[marcaStore.marcas.length - 1]
    formData.value.marca_id = ultimaMarca.id
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">
        {{ isEditing ? 'Editar' : 'Crear' }} Producto
      </h1>
    </div>

    <div v-if="loading" class="text-center py-12">
      Cargando...
    </div>
    
    <form v-else @submit.prevent="handleSubmit" class="space-y-6 max-w-3xl">
      <div class="bg-white shadow-sm rounded-lg p-6">
        <!-- Información básica -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseInput
            v-model="formData.nombre"
            label="Nombre del producto"
            required
          />
          
          <BaseInput
            v-model="formData.codigo"
            label="Código del producto"
            placeholder="Código interno o código de barras"
          />

          <BaseSelect
            v-model="formData.tipo_codigo"
            label="Tipo de código"
            :options="tiposCodigo"
            required
          />

          <BaseInput
            v-model="formData.cantidad_mayoreo"
            label="Cantidad para mayoreo"
            type="number"
            placeholder="Cantidad mínima para precio mayorista"
          />
          
          <div class="space-y-2">
            <BaseSelect
              v-model="formData.categoria_id"
              label="Categoría"
              :options="categorias"
              required
            />
            <button
              type="button"
              @click="abrirCategoriaModal"
              class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-[#33c7d1] bg-[#33c7d1] bg-opacity-10 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#33c7d1]"
            >
              <i class="fas fa-plus mr-1"></i>
              Agregar Categoría
            </button>
          </div>
          
          <div class="space-y-2">
            <BaseSelect
              v-model="formData.marca_id"
              label="Marca"
              :options="marcas"
              required
            />
            <button
              type="button"
              @click="abrirMarcaModal"
              class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-[#33c7d1] bg-[#33c7d1] bg-opacity-10 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#33c7d1]"
            >
              <i class="fas fa-plus mr-1"></i>
              Agregar Marca
            </button>
          </div>
        </div>

        <!-- Precios -->
        <div class="mt-6 space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Precios</h3>
          
          <!-- Precio L1 (Precio Base) -->
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Precio Base (L1)</h4>
            <BaseInput
              v-model="formData.precio_l1"
              type="number"
              label="Precio Base"
              placeholder="0.00"
              required
              step="0.01"
              min="0"
            />
            <p class="mt-1 text-sm text-gray-500">Este es el precio base del producto</p>
          </div>

          <!-- Precios de Mayoreo -->
          <div class="mt-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Precios de Mayoreo</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BaseInput
                v-model="formData.precio_l2"
                type="number"
                label="Precio L2"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <BaseInput
                v-model="formData.precio_l3"
                type="number"
                label="Precio L3"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <BaseInput
                v-model="formData.precio_l4"
                type="number"
                label="Precio L4"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <p class="mt-1 text-sm text-gray-500">Estos son los precios para ventas al mayoreo</p>
          </div>
        </div>

        <!-- Descripción -->
        <div class="mt-6">
          <label class="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            v-model="formData.descripcion"
            rows="4"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1] sm:text-sm"
          />
        </div>

        <!-- Imágenes -->
        <div class="mt-6 space-y-6">
          <h3 class="text-lg font-medium text-gray-900">Imágenes del Producto</h3>
          
          <!-- Imagen Principal -->
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Imagen Principal</h4>
            <div class="flex items-start space-x-4">
              <!-- Preview de imagen actual -->
              <div v-if="imagenPrincipalPreview" class="w-32 h-32 relative">
                <img
                  :src="imagenPrincipalPreview"
                  alt="Preview"
                  class="w-32 h-32 object-cover rounded-lg"
                />
              </div>
              
              <!-- Input para nueva imagen -->
              <div class="flex-1">
                <input
                  type="file"
                  @change="handleImagenPrincipal"
                  accept="image/*"
                  class="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[#33c7d1] file:text-white
                    hover:file:bg-[#2ba3ac]"
                />
                <p class="mt-1 text-sm text-gray-500">
                  Selecciona una nueva imagen principal para el producto
                </p>
              </div>
            </div>
          </div>

          <!-- Imágenes Adicionales -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">Imágenes Adicionales</h3>
            <p class="text-sm text-gray-500">Puedes agregar hasta 5 imágenes adicionales del producto</p>
            
            <!-- Vista previa de imágenes adicionales existentes -->
            <div v-if="formData.imagenes_adicionales?.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div v-for="(imagen, index) in formData.imagenes_adicionales" :key="index" class="relative group">
                <img :src="imagen" :alt="`Imagen adicional ${index + 1}`" class="w-full h-32 object-cover rounded-lg">
                <button 
                  @click="eliminarImagenAdicional(index)"
                  class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <!-- Input para nuevas imágenes adicionales -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700">Agregar más imágenes</label>
              <input
                type="file"
                @change="handleImagenesAdicionales"
                multiple
                accept="image/*"
                class="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#33c7d1] file:text-white
                  hover:file:bg-[#2ab3bc]"
              >
              <p class="mt-1 text-sm text-gray-500">
                Selecciona hasta 5 imágenes adicionales
              </p>
            </div>
          </div>
        </div>

        <!-- Estado -->
        <div class="mt-6">
          <label class="inline-flex items-center">
            <input
              type="checkbox"
              v-model="formData.agotado"
              class="rounded border-gray-300 text-[#33c7d1] shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1]"
            >
            <span class="ml-2 text-sm text-gray-600">Producto agotado</span>
          </label>
        </div>
      </div>

      <!-- Mensaje de error -->
      <div v-if="error" class="text-red-600 text-sm">
        {{ error }}
      </div>

      <!-- Botones -->
      <div class="flex justify-end space-x-4">
        <button
          type="button"
          @click="router.push('/dashboard/productos')"
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#33c7d1]"
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          :disabled="saving"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#33c7d1] hover:bg-[#2ba3ac] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#33c7d1] disabled:opacity-50"
        >
          {{ saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
        </button>
      </div>
    </form>

    <!-- Modales para Categorías y Marcas -->
    <CategoriaModal
      :is-open="showCategoriaModal"
      :categoria="categoriaSeleccionada"
      @close="cerrarCategoriaModal"
      @saved="onCategoriaSaved"
    />

    <MarcaModal
      :is-open="showMarcaModal"
      :marca="marcaSeleccionada"
      @close="cerrarMarcaModal"
      @saved="onMarcaSaved"
    />
  </div>
</template> 