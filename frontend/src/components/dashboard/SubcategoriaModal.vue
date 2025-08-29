<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">
          {{ isEditing ? 'Editar Subcategoría' : 'Agregar Subcategoría' }}
        </h3>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Categoría -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Categoría *
          </label>
          <BaseSelect
            v-model="form.categoria_id"
            :options="categorias"
            placeholder="Seleccionar categoría"
            required
          />
        </div>

        <!-- Nombre -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Nombre *
          </label>
          <BaseInput
            v-model="form.nombre"
            type="text"
            placeholder="Nombre de la subcategoría"
            required
          />
        </div>

        <!-- Estado -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <BaseSelect
            v-model="form.estado"
            :options="[
              { label: 'Activo', value: 'activo' },
              { label: 'Inactivo', value: 'inactivo' }
            ]"
            option-label="label"
            option-value="value"
            placeholder="Seleccionar estado"
          />
        </div>

        <!-- Botones -->
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useSubcategoriaStore } from '@/stores/subcategoria'
import { useCategoriaStore } from '@/stores/categoria'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  },
  subcategoria: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const subcategoriaStore = useSubcategoriaStore()
const categoriaStore = useCategoriaStore()

const loading = ref(false)
const isEditing = computed(() => !!props.subcategoria)

const form = reactive({
  categoria_id: '',
  nombre: '',
  estado: 'activo'
})

// Observar cambios en la subcategoría para modo edición
watch(() => props.subcategoria, (newSubcategoria) => {
  if (newSubcategoria) {
    console.log('Subcategoría cambiada, actualizando formulario:', newSubcategoria)
    form.categoria_id = newSubcategoria.categoria_id
    form.nombre = newSubcategoria.nombre
    form.estado = newSubcategoria.estado || 'activo'
    console.log('Formulario actualizado:', form)
  }
}, { immediate: true })

// Cargar categorías al abrir el modal
watch(() => props.showModal, async (newVal) => {
  if (newVal) {
    console.log('Modal abierto, cargando categorías...')
    await categoriaStore.fetchCategorias()
    console.log('Categorías cargadas:', categoriaStore.categorias)
    
    if (props.subcategoria) {
      console.log('Editando subcategoría:', props.subcategoria)
      form.categoria_id = props.subcategoria.categoria_id
      form.nombre = props.subcategoria.nombre
      form.estado = props.subcategoria.estado || 'activo'
      console.log('Formulario cargado:', form)
    } else {
      console.log('Creando nueva subcategoría')
      resetForm()
    }
  }
})

const categorias = computed(() => {
  const mapped = categoriaStore.categorias.map(cat => ({ value: cat.id, label: cat.nombre }))
  console.log('Categorías mapeadas:', mapped)
  return mapped
})

const resetForm = () => {
  form.categoria_id = ''
  form.nombre = ''
  form.estado = 'activo'
}

const closeModal = () => {
  resetForm()
  emit('close')
}

const handleSubmit = async () => {
  try {
    loading.value = true
    
    if (isEditing.value) {
      await subcategoriaStore.updateSubcategoria(props.subcategoria.id, form)
    } else {
      await subcategoriaStore.createSubcategoria(form)
    }
    
    emit('saved')
    closeModal()
  } catch (error) {
    console.error('Error al guardar subcategoría:', error)
  } finally {
    loading.value = false
  }
}
</script>
