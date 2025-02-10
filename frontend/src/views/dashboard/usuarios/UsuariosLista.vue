<script setup>
import { ref, onMounted } from 'vue'
import { useUsuarioStore } from '../../../stores/usuario'
import { useRouter } from 'vue-router'
import BaseTable from '@/components/common/BaseTable.vue'
import BasePagination from '@/components/common/BasePagination.vue'
import BaseFilters from '@/components/common/BaseFilters.vue'
import { generateBasicCredentials } from '@/utils/userCredentials'
import Swal from 'sweetalert2'

const usuarioStore = useUsuarioStore()
const router = useRouter()
const usuarios = ref([])
const loading = ref(true)

// Configuración de filtros
const filters = [
  {
    key: 'search',
    label: 'Buscar',
    type: 'text',
    placeholder: 'Buscar por nombre, email...'
  },
  {
    key: 'tipo_usuario',
    label: 'Tipo de Usuario',
    type: 'select',
    options: [
      { value: '', label: 'Todos' },
      { value: 'administrador', label: 'Administrador' },
      { value: 'vendedor', label: 'Vendedor' },
      { value: 'cliente', label: 'Cliente' }
    ]
  },
  {
    key: 'estado',
    label: 'Estado',
    type: 'select',
    options: [
      { value: '', label: 'Todos' },
      { value: 'activo', label: 'Activo' },
      { value: 'inactivo', label: 'Inactivo' }
    ]
  }
]

// Función para manejar cambios en los filtros
const handleFilterChange = async (filterValues) => {
  loading.value = true
  try {
    await usuarioStore.setFiltros(filterValues)
    usuarios.value = usuarioStore.usuarios
  } catch (error) {
    console.error('Error al filtrar:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    await usuarioStore.fetchUsuarios()
    usuarios.value = usuarioStore.usuarios
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
  } finally {
    loading.value = false
  }
})

const tableHeaders = [
  { key: 'usuario', label: 'Usuario' },
  { key: 'email', label: 'Email' },
  { key: 'rol', label: 'Rol' },
  { key: 'estado', label: 'Estado' },
  { key: 'acciones', label: 'Acciones' }
]

const handlePageChange = async (page) => {
  usuarioStore.paginacion.pagina = page
  await usuarioStore.fetchUsuarios()
  usuarios.value = usuarioStore.usuarios
}

const editarUsuario = (id) => {
  router.push(`/dashboard/usuarios/${id}/editar`)
}

const crearUsuario = () => {
  router.push('/dashboard/usuarios/crear')
}

const cambiarEstado = async (id, estado) => {
  try {
    await usuarioStore.updateEstado(id, estado)
    await usuarioStore.fetchUsuarios() // Recargar la lista completa
    usuarios.value = usuarioStore.usuarios
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    // Aquí podrías agregar una notificación de error para el usuario
  }
}

const enviarCredencialesPorEmail = async (usuario) => {
  try {
    // Confirmación antes de enviar
    const result = await Swal.fire({
      title: '¿Enviar credenciales?',
      text: `Se enviarán nuevas credenciales al correo ${usuario.email}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#33c7d1',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar'
    })

    if (!result.isConfirmed) return

    // Solo enviamos email y username al backend
    await usuarioStore.sendCredentialsByEmail(usuario.id, {
      email: usuario.email,
      username: usuario.email
    })

    // Mensaje de éxito
    await Swal.fire({
      title: '¡Enviado!',
      text: 'Las nuevas credenciales han sido enviadas exitosamente',
      icon: 'success'
    })
  } catch (error) {
    // Manejo de errores
    await Swal.fire({
      title: 'Error',
      text: 'No se pudieron enviar las credenciales',
      icon: 'error'
    })
  }
}

const enviarCredencialesPorWhatsApp = (usuario) => {
  const credentials = generateBasicCredentials(usuario)
  const mensaje = `¡Hola ${usuario.nombre}! Tus credenciales para acceder al sistema son:\n\nUsuario: ${credentials.username}\nContraseña: ${credentials.password}\n\nPuedes acceder desde: ${window.location.origin}`
  
  const whatsappUrl = `https://wa.me/${usuario.telefono}?text=${encodeURIComponent(mensaje)}`
  window.open(whatsappUrl, '_blank')
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

    <!-- Filtros -->
    <BaseFilters
      :filters="filters"
      @filter-change="handleFilterChange"
    />

    <!-- Tabla -->
    <BaseTable :headers="tableHeaders" :loading="loading">
      <tr v-for="usuario in usuarios" :key="usuario.id" class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <div>
              <div class="text-sm font-medium text-gray-900">
                {{ usuario.nombre || 'Sin nombre' }}
              </div>
              <div class="text-sm text-gray-500">
                {{ usuario.empresa || 'Sin empresa' }}
              </div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">{{ usuario.email || 'Sin email' }}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span 
            class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
            :class="{
              'bg-blue-100 text-blue-800': usuario.tipo_usuario === 'administrador',
              'bg-green-100 text-green-800': usuario.tipo_usuario === 'vendedor',
              'bg-yellow-100 text-yellow-800': usuario.tipo_usuario === 'cliente'
            }"
          >
            {{ usuario.tipo_usuario || 'Sin rol' }}
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
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
          <button
            @click="enviarCredencialesPorEmail(usuario)"
            class="text-blue-600 hover:text-blue-900"
            title="Enviar credenciales por email"
          >
            <i class="fas fa-envelope"></i>
          </button>
          <button
            v-if="usuario.telefono"
            @click="enviarCredencialesPorWhatsApp(usuario)"
            class="text-green-600 hover:text-green-900"
            title="Enviar credenciales por WhatsApp"
          >
            <i class="fab fa-whatsapp"></i>
          </button>
          <button
            @click="editarUsuario(usuario.id)"
            class="text-[#33c7d1] hover:text-[#2ba3ac]"
          >
            Editar
          </button>
          <button
            @click="cambiarEstado(usuario.id, usuario.estado === 'activo' ? 'inactivo' : 'activo')"
            :class="{
              'text-red-600 hover:text-red-900': usuario.estado === 'activo',
              'text-green-600 hover:text-green-900': usuario.estado === 'inactivo'
            }"
          >
            {{ usuario.estado === 'activo' ? 'Desactivar' : 'Activar' }}
          </button>
        </td>
      </tr>
    </BaseTable>

    <!-- Paginación -->
    <BasePagination
      :total-pages="usuarioStore.paginacion.totalPaginas"
      :current-page="usuarioStore.paginacion.pagina"
      :total-items="usuarioStore.paginacion.total"
      @page-change="handlePageChange"
    />
  </div>
</template> 