<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductoStore } from '@/stores/producto'
import { useCategoriaStore } from '@/stores/categoria'
import { useMarcaStore } from '@/stores/marca'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

const route = useRoute()
const router = useRouter()
const productoStore = useProductoStore()
const categoriaStore = useCategoriaStore()
const marcaStore = useMarcaStore()

const isEditing = !!route.params.id
const loading = ref(false)
const saving = ref(false)
const error = ref(null)

const formData = ref({
  nombre: '',
  descripcion: '',
  codigo: '',
  precio_l1: '',
  precio_l2: '',
  precio_l3: '',
  precio_l4: '',
  stock: '',
  cantidad_mayoreo: '',
  categoria_id: '',
  marca_id: '',
  imagen_url: '',
  activo: true
})

const categorias = ref([])
const marcas = ref([])

onMounted(async () => {
  try {
    loading.value = true
    
    // Cargar categorías y marcas
    const [categoriasData, marcasData] = await Promise.all([
      categoriaStore.fetchCategorias(),
      marcaStore.fetchMarcas()
    ])
    
    categorias.value = categoriasData.map(c => ({
      value: c.id,
      label: c.nombre
    }))
    
    marcas.value = marcasData.map(m => ({
      value: m.id,
      label: m.nombre
    }))

    // Si estamos editando, cargar datos del producto
    if (isEditing) {
      const producto = await productoStore.fetchProductoById(route.params.id)
      formData.value = { ...producto }
    }
  } catch (err) {
    error.value = 'Error al cargar los datos'
    console.error(err)
  } finally {
    loading.value = false
  }
})

const handleSubmit = async () => {
  saving.value = true
  error.value = null

  try {
    if (isEditing) {
      await productoStore.updateProducto(route.params.id, formData.value)
    } else {
      await productoStore.createProducto(formData.value)
    }
    router.push('/dashboard/productos')
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al guardar el producto'
  } finally {
    saving.value = false
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
            label="Código"
            required
          />
          
          <BaseSelect
            v-model="formData.categoria_id"
            label="Categoría"
            :options="categorias"
            required
          />
          
          <BaseSelect
            v-model="formData.marca_id"
            label="Marca"
            :options="marcas"
            required
          />
        </div>

        <!-- Precios -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <BaseInput
            v-model="formData.precio_l1"
            label="Precio L1"
            type="number"
            required
          />
          
          <BaseInput
            v-model="formData.precio_l2"
            label="Precio L2"
            type="number"
            required
          />
          
          <BaseInput
            v-model="formData.precio_l3"
            label="Precio L3"
            type="number"
            required
          />
          
          <BaseInput
            v-model="formData.precio_l4"
            label="Precio L4"
            type="number"
            required
          />
        </div>

        <!-- Stock y cantidad mayoreo -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseInput
            v-model="formData.stock"
            label="Stock"
            type="number"
            required
          />
          
          <BaseInput
            v-model="formData.cantidad_mayoreo"
            label="Cantidad mayoreo"
            type="number"
            required
          />
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

        <!-- URL de imagen -->
        <div class="mt-6">
          <BaseInput
            v-model="formData.imagen_url"
            label="URL de imagen"
            type="url"
            required
          />
        </div>

        <!-- Estado -->
        <div class="mt-6">
          <label class="inline-flex items-center">
            <input
              type="checkbox"
              v-model="formData.activo"
              class="rounded border-gray-300 text-[#33c7d1] shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1]"
            >
            <span class="ml-2 text-sm text-gray-600">Producto activo</span>
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
  </div>
</template> 