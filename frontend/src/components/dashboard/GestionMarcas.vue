<template>
  <div class="bg-white shadow-sm rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-medium text-gray-900">Gestión de Marcas</h3>
      <button
        @click="abrirModal"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#33c7d1] hover:bg-[#2ba3ac] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#33c7d1]"
      >
        <i class="fas fa-plus mr-2"></i>
        Nueva Marca
      </button>
    </div>

    <!-- Tabla de marcas -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripción
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              País de Origen
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Productos
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="marca in marcas" :key="marca.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ marca.nombre }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ marca.descripcion || 'Sin descripción' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ marca.pais_origen || 'No especificado' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  marca.estado === 'activo' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                ]"
              >
                {{ marca.estado === 'activo' ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ marca.productos_count || 0 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <button
                @click="editarMarca(marca)"
                class="text-[#33c7d1] hover:text-[#2ba3ac]"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                @click="confirmarEliminacion(marca)"
                class="text-red-600 hover:text-red-900"
                :disabled="marca.productos_count && marca.productos_count > 0"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="text-center py-4">
      <div class="inline-flex items-center">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-[#33c7d1]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Cargando marcas...
      </div>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
      <div class="flex">
        <div class="flex-shrink-0">
          <i class="fas fa-exclamation-triangle text-red-400"></i>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex items-center mb-4">
          <div class="flex-shrink-0">
            <i class="fas fa-exclamation-triangle text-red-400 text-2xl"></i>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-medium text-gray-900">Confirmar eliminación</h3>
          </div>
        </div>
        
        <p class="text-sm text-gray-500 mb-6">
          ¿Estás seguro de que quieres eliminar la marca <strong>"{{ marcaAEliminar?.nombre }}"</strong>?
          {{ marcaAEliminar?.productos_count && marcaAEliminar.productos_count > 0 
            ? `Esta marca tiene ${marcaAEliminar.productos_count} producto(s) y no se puede eliminar.` 
            : 'Esta acción no se puede deshacer.' }}
        </p>

        <div class="flex justify-end space-x-3">
          <button
            @click="cerrarDeleteModal"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            v-if="!marcaAEliminar?.productos_count || marcaAEliminar.productos_count === 0"
            @click="eliminarMarca"
            :disabled="deleting"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de marca -->
    <MarcaModal
      :is-open="showModal"
      :marca="marcaSeleccionada"
      @close="cerrarModal"
      @saved="onMarcaSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMarcaStore } from '@/stores/marca'
import MarcaModal from './MarcaModal.vue'

const marcaStore = useMarcaStore()

const loading = ref(false)
const error = ref(null)
const showModal = ref(false)
const showDeleteModal = ref(false)
const marcaSeleccionada = ref(null)
const marcaAEliminar = ref(null)
const deleting = ref(false)

const marcas = computed(() => marcaStore.marcas)

onMounted(async () => {
  await cargarMarcas()
})

const cargarMarcas = async () => {
  try {
    loading.value = true
    error.value = null
    await marcaStore.fetchMarcas()
  } catch (err) {
    error.value = err.message || 'Error al cargar las marcas'
  } finally {
    loading.value = false
  }
}

const abrirModal = () => {
  console.log('Abriendo modal de marca')
  marcaSeleccionada.value = null
  showModal.value = true
  console.log('showModal.value:', showModal.value)
}

const cerrarModal = () => {
  showModal.value = false
  marcaSeleccionada.value = null
}

const editarMarca = (marca) => {
  console.log('Editando marca:', marca)
  marcaSeleccionada.value = marca
  showModal.value = true
  console.log('showModal.value:', showModal.value)
}

const confirmarEliminacion = (marca) => {
  marcaAEliminar.value = marca
  showDeleteModal.value = true
}

const cerrarDeleteModal = () => {
  showDeleteModal.value = false
  marcaAEliminar.value = null
}

const eliminarMarca = async () => {
  if (!marcaAEliminar.value) return
  
  try {
    deleting.value = true
    await marcaStore.deleteMarca(marcaAEliminar.value.id)
    cerrarDeleteModal()
  } catch (err) {
    error.value = err.message || 'Error al eliminar la marca'
  } finally {
    deleting.value = false
  }
}

const onMarcaSaved = async () => {
  await cargarMarcas()
}
</script>
