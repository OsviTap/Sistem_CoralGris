<script setup>
import { ref, onMounted } from 'vue'
import { useUsuarioStore } from '@/stores/usuario'
import { useRouter } from 'vue-router'

const usuarioStore = useUsuarioStore()
const router = useRouter()
const usuarios = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await usuarioStore.fetchUsuarios()
    usuarios.value = data
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
  } finally {
    loading.value = false
  }
})

const editarUsuario = (id) => {
  router.push(`/dashboard/usuarios/${id}/editar`)
}

const crearUsuario = () => {
  router.push('/dashboard/usuarios/crear')
}

const cambiarEstado = async (id, estado) => {
  try {
    await usuarioStore.updateEstado(id, estado)
    const index = usuarios.value.findIndex(u => u.id === id)
    if (index !== -1) {
      usuarios.value[index].estado = estado
    }
  } catch (error) {
    console.error('Error al cambiar estado:', error)
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Usuarios</h1>
      <button
        @click="crearUsuario"
        class="bg-[#33c7d1] text-white px-4 py-2 rounded-lg hover:bg-[#2ba3ac] transition-colors"
      >
        Crear Usuario
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#33c7d1]"></div>
    </div>

    <!-- Tabla de usuarios -->
    <div v-else class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuario
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rol
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="usuario in usuarios" :key="usuario.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ usuario.nombre }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ usuario.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                {{ usuario.tipo_usuario }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="{
                  'bg-green-100 text-green-800': usuario.estado === 'activo',
                  'bg-red-100 text-red-800': usuario.estado === 'inactivo'
                }"
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
              >
                {{ usuario.estado }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="editarUsuario(usuario.id)"
                class="text-[#33c7d1] hover:text-[#2ba3ac] mr-3"
              >
                Editar
              </button>
              <button
                v-if="usuario.estado === 'activo'"
                @click="cambiarEstado(usuario.id, 'inactivo')"
                class="text-red-600 hover:text-red-900"
              >
                Desactivar
              </button>
              <button
                v-else
                @click="cambiarEstado(usuario.id, 'activo')"
                class="text-green-600 hover:text-green-900"
              >
                Activar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template> 