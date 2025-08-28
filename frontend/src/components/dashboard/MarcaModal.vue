<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay de fondo -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>

      <!-- Modal -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-[#33c7d1] bg-opacity-100 sm:mx-0 sm:h-10 sm:w-10">
              <i class="fas fa-trademark text-white text-lg"></i>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ isEditing ? 'Editar' : 'Agregar' }} Marca
              </h3>
              <div class="mt-4">
                <form @submit.prevent="handleSubmit" class="space-y-4">
                  <div>
                    <label for="nombre" class="block text-sm font-medium text-gray-700">
                      Nombre de la Marca
                    </label>
                    <input
                      id="nombre"
                      v-model="formData.nombre"
                      type="text"
                      required
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1] sm:text-sm"
                      placeholder="Ej: Faber-Castell, Bic, Pilot"
                    />
                  </div>

                  <div>
                    <label for="descripcion" class="block text-sm font-medium text-gray-700">
                      Descripción (Opcional)
                    </label>
                    <textarea
                      id="descripcion"
                      v-model="formData.descripcion"
                      rows="3"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1] sm:text-sm"
                      placeholder="Descripción breve de la marca"
                    />
                  </div>

                  <div>
                    <label for="pais_origen" class="block text-sm font-medium text-gray-700">
                      País de Origen (Opcional)
                    </label>
                    <input
                      id="pais_origen"
                      v-model="formData.pais_origen"
                      type="text"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1] sm:text-sm"
                      placeholder="Ej: Alemania, Japón, Estados Unidos"
                    />
                  </div>

                  <div>
                    <label for="estado" class="block text-sm font-medium text-gray-700">
                      Estado
                    </label>
                    <select
                      id="estado"
                      v-model="formData.estado"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1] sm:text-sm"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-exclamation-triangle text-red-400"></i>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="handleSubmit"
            :disabled="saving"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#33c7d1] text-base font-medium text-white hover:bg-[#2ba3ac] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#33c7d1] sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            <i v-if="saving" class="fas fa-spinner fa-spin mr-2"></i>
            {{ saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
          </button>
          <button
            type="button"
            @click="closeModal"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#33c7d1] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useMarcaStore } from '@/stores/marca'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  marca: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const marcaStore = useMarcaStore()
const saving = ref(false)
const error = ref(null)

const formData = ref({
  nombre: '',
  descripcion: '',
  pais_origen: '',
  estado: 'activo'
})

const resetForm = () => {
  formData.value = {
    nombre: '',
    descripcion: '',
    pais_origen: '',
    estado: 'activo'
  }
  error.value = null
}

const isEditing = computed(() => !!props.marca)

// Observar cambios en la marca para modo edición
watch(() => props.marca, (newMarca) => {
  if (newMarca) {
    formData.value = {
      nombre: newMarca.nombre || '',
      descripcion: newMarca.descripcion || '',
      pais_origen: newMarca.pais_origen || '',
      estado: newMarca.estado || 'activo'
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Observar apertura del modal
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && !props.marca) {
    resetForm()
  }
})

const closeModal = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (!formData.value.nombre.trim()) {
    error.value = 'El nombre de la marca es requerido'
    return
  }

  saving.value = true
  error.value = null

  try {
    if (isEditing.value) {
      await marcaStore.updateMarca(props.marca.id, formData.value)
    } else {
      await marcaStore.createMarca(formData.value)
    }
    
    emit('saved')
    closeModal()
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al guardar la marca'
  } finally {
    saving.value = false
  }
}
</script>
