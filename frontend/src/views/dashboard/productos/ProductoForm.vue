<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductoStore } from '@/stores/producto'
import { useCategoriaStore } from '@/stores/categoria'
import { useMarcaStore } from '@/stores/marca'
import { useSubcategoriaStore } from '@/stores/subcategoria'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import RichTextEditor from '@/components/common/RichTextEditor.vue'
import CategoriaModal from '@/components/dashboard/CategoriaModal.vue'
import MarcaModal from '@/components/dashboard/MarcaModal.vue'
import SubcategoriaModal from '@/components/dashboard/SubcategoriaModal.vue'

const route = useRoute()
const router = useRouter()
const productoStore = useProductoStore()
const categoriaStore = useCategoriaStore()
const marcaStore = useMarcaStore()
const subcategoriaStore = useSubcategoriaStore()

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
  subcategoria_id: '',
  marca_id: '',
  imagen_url: '',
  imagenes_adicionales: [],
  agotado: false
})

const categorias = ref([])
const subcategorias = ref([])
const marcas = ref([])

const tiposCodigo = [
  { value: 'NORMAL', label: 'Código Normal' },
  { value: 'BARRA', label: 'Código de Barra' }
]

const imagenPrincipalPreview = ref('')
const imagenesAdicionalesPreview = ref([])

// Modales para categorías, subcategorías y marcas
const showCategoriaModal = ref(false)
const showSubcategoriaModal = ref(false)
const showMarcaModal = ref(false)
const categoriaSeleccionada = ref(null)
const subcategoriaSeleccionada = ref(null)
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
    // Cargar categorías, subcategorías y marcas
    const [categoriasData, subcategoriasData, marcasData] = await Promise.all([
      categoriaStore.fetchCategorias(),
      subcategoriaStore.fetchSubcategorias(),
      marcaStore.fetchMarcas()
    ])

    if (categoriasData) {
      categorias.value = categoriasData.map(cat => ({
        value: cat.id,
        label: cat.nombre
      }))
    }

    if (subcategoriasData) {
      subcategorias.value = subcategoriasData.map(sub => ({
        value: sub.id,
        label: sub.nombre,
        categoria_id: sub.categoria_id
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
            subcategoria_id: producto.subcategoria_id || '',
            marca_id: producto.marca_id || '',
            imagen_url: producto.imagen_url || '',
            imagenes_adicionales: producto.imagenes_adicionales || [],
            agotado: producto.agotado || false
          }
          
          // Cargar subcategorías de la categoría del producto ANTES de establecer subcategoria_id
          if (producto.categoria_id) {
            await loadSubcategoriasByCategoria(producto.categoria_id)
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

// Limpiar subcategoría cuando cambia la categoría
watch(() => formData.value.categoria_id, async (newCategoriaId, oldCategoriaId) => {
  if (newCategoriaId !== oldCategoriaId) {
    // Solo limpiar subcategoría si la categoría cambió realmente (no en carga inicial)
    // y si la subcategoría pertenece a una categoría diferente
    if (oldCategoriaId && newCategoriaId && formData.value.subcategoria_id) {
      // Cargar subcategorías de la nueva categoría primero
      await loadSubcategoriasByCategoria(newCategoriaId)

      // Verificar si la subcategoría actual pertenece a la nueva categoría
      const subcategoriaPertenece = subcategorias.value.some(sub => sub.value == formData.value.subcategoria_id)
      if (!subcategoriaPertenece) {
        formData.value.subcategoria_id = ''
      }
    } else if (newCategoriaId) {
      // Cargar subcategorías de la nueva categoría
      await loadSubcategoriasByCategoria(newCategoriaId)
    } else {
      subcategorias.value = []
      formData.value.subcategoria_id = ''
    }
  }
})

// Computed para subcategorías filtradas por categoría
const subcategoriasFiltradas = computed(() => {
  if (!formData.value.categoria_id) {
    return []
  }

  // Convertir ambos a números para comparación
  const categoriaId = parseInt(formData.value.categoria_id)

  const filtradas = subcategorias.value.filter(sub => {
    const subCategoriaId = parseInt(sub.categoria_id)
    return subCategoriaId === categoriaId
  })

  return filtradas
})

const handleSubmit = async () => {
  saving.value = true
  error.value = null

  try {
    // Preparar los datos para enviar
    const datosParaEnviar = { ...formData.value }
    
    // Limpiar campos vacíos que causan problemas con bigint
    if (datosParaEnviar.categoria_id === '' || datosParaEnviar.categoria_id === null) {
      delete datosParaEnviar.categoria_id
    }
    if (datosParaEnviar.subcategoria_id === '' || datosParaEnviar.subcategoria_id === null) {
      delete datosParaEnviar.subcategoria_id
    }
    if (datosParaEnviar.marca_id === '' || datosParaEnviar.marca_id === null) {
      delete datosParaEnviar.marca_id
    }
    if (datosParaEnviar.cantidad_mayoreo === '' || datosParaEnviar.cantidad_mayoreo === null) {
      delete datosParaEnviar.cantidad_mayoreo
    }
    
    // Convertir campos numéricos
    if (datosParaEnviar.precio_l1) datosParaEnviar.precio_l1 = Number(datosParaEnviar.precio_l1)
    if (datosParaEnviar.precio_l2) datosParaEnviar.precio_l2 = Number(datosParaEnviar.precio_l2)
    if (datosParaEnviar.precio_l3) datosParaEnviar.precio_l3 = Number(datosParaEnviar.precio_l3)
    if (datosParaEnviar.precio_l4) datosParaEnviar.precio_l4 = Number(datosParaEnviar.precio_l4)
    
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

const cerrarSubcategoriaModal = () => {
  showSubcategoriaModal.value = false
  subcategoriaSeleccionada.value = null
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

const onSubcategoriaSaved = async () => {
  // Recargar subcategorías y actualizar el select
  await subcategoriaStore.fetchSubcategorias()
  subcategorias.value = subcategoriaStore.subcategorias.map(sub => ({
    value: sub.id,
    label: sub.nombre,
    categoria_id: sub.categoria_id
  }))
  
  // Si se creó una nueva subcategoría, seleccionarla automáticamente
  if (subcategoriaStore.subcategorias.length > 0) {
    const ultimaSubcategoria = subcategoriaStore.subcategorias[subcategoriaStore.subcategorias.length - 1]
    formData.value.subcategoria_id = ultimaSubcategoria.id
  }
}

// Función para cargar subcategorías por categoría
const loadSubcategoriasByCategoria = async (categoriaId) => {
  try {
    const subcategoriasData = await subcategoriaStore.fetchSubcategoriasByCategoria(categoriaId)

    subcategorias.value = subcategoriasData.map(sub => ({
      value: sub.id,
      label: sub.nombre,
      categoria_id: sub.categoria_id
    }))
  } catch (error) {
    console.error('Error al cargar subcategorías por categoría:', error)
    subcategorias.value = []
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
              v-model="formData.subcategoria_id"
              label="Subcategoría"
              :options="subcategoriasFiltradas"
              :placeholder="formData.categoria_id ? 'Seleccionar subcategoría' : 'Primero selecciona una categoría'"
              :disabled="!formData.categoria_id"
            />
            <button
              type="button"
              @click="abrirSubcategoriaModal"
              :disabled="!formData.categoria_id"
              class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-[#33c7d1] bg-[#33c7d1] bg-opacity-10 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#33c7d1] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-plus mr-1"></i>
              Agregar Subcategoría
            </button>
            <p v-if="!formData.categoria_id" class="text-sm text-gray-500">
              Selecciona una categoría primero para poder agregar subcategorías
            </p>
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
          <RichTextEditor
            v-model="formData.descripcion"
            label="Descripción del Producto"
            placeholder="Describe las características, beneficios y detalles del producto..."
            help-text="Usa las herramientas de formato para hacer tu descripción más atractiva"
            :height="250"
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

    <!-- Modales para Categorías, Subcategorías y Marcas -->
    <CategoriaModal
      :is-open="showCategoriaModal"
      :categoria="categoriaSeleccionada"
      @close="cerrarCategoriaModal"
      @saved="onCategoriaSaved"
    />

    <SubcategoriaModal
      :show-modal="showSubcategoriaModal"
      :subcategoria="subcategoriaSeleccionada"
      @close="cerrarSubcategoriaModal"
      @saved="onSubcategoriaSaved"
    />

    <MarcaModal
      :is-open="showMarcaModal"
      :marca="marcaSeleccionada"
      @close="cerrarMarcaModal"
      @saved="onMarcaSaved"
    />
  </div>
</template> 