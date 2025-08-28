<script setup>
import { ref, watch, onMounted } from 'vue'
import { useUsuarioStore } from '../../../stores/usuario'
import { useRouter, useRoute } from 'vue-router'
import { generateBasicCredentials } from '@/utils/userCredentials'
import Swal from 'sweetalert2'

const usuarioStore = useUsuarioStore()
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const error = ref(null)
const showPassword = ref(false)

const usuario = ref({
  nombre: '',
  email: '',
  password: '',
  tipo_usuario: '',
  telefono: '',
  empresa: '',
  ruc: '',
  direccion: '',
  nivel_precio: '',
  sucursal_id: null,
  estado: 'activo'
})

// Watch para manejar cambios en tipo de usuario
watch([() => usuario.value.tipo_usuario, () => usuario.value.nombre, () => usuario.value.ruc], 
  ([newTipo]) => {
    if (newTipo === 'cliente' && usuario.value.nombre && usuario.value.ruc) {
      const tempUser = {
        nombre: usuario.value.nombre,
        email: usuario.value.email,
        ruc: usuario.value.ruc,
        tipo_usuario: 'cliente'
      }
      const credentials = generateBasicCredentials(tempUser)
      usuario.value.password = credentials.password
    }
  }
)

onMounted(async () => {
  try {
    loading.value = true
    const data = await usuarioStore.fetchUsuario(route.params.id)
    usuario.value = {
      ...data,
      password: '' // No mostrar la contraseña actual
    }
  } catch (err) {
    error.value = 'Error al cargar el usuario'
  } finally {
    loading.value = false
  }
})

const validarPassword = (password) => {
  if (!password) return true // Permitir vacío para mantener la contraseña actual
  
  // Mínimo 8 caracteres, al menos una letra y un número
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
  return regex.test(password)
}

const guardarUsuario = async () => {
  loading.value = true
  error.value = null
  
  try {
    const usuarioData = { ...usuario.value }

    // Validar contraseña solo si se está cambiando y no es cliente
    if (usuarioData.password && usuarioData.tipo_usuario !== 'cliente') {
      if (!validarPassword(usuarioData.password)) {
        throw new Error('La contraseña debe tener al menos 8 caracteres, una letra y un número')
      }
    }

    if (!usuarioData.password) {
      delete usuarioData.password // No enviar password si está vacío
    }
    
    await usuarioStore.updateUsuario(route.params.id, usuarioData)
    router.push('/dashboard/usuarios')
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Error al actualizar usuario'
  } finally {
    loading.value = false
  }
}

const cancelar = () => {
  router.push('/dashboard/usuarios')
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Editar Usuario</h1>
      </div>

      <div v-if="loading" class="text-center py-4">
        <span class="text-gray-600">Cargando...</span>
      </div>

      <form v-else @submit.prevent="guardarUsuario" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <!-- Alerta de error -->
        <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ error }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Nombre -->
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Nombre
            </label>
            <input
              v-model="usuario.nombre"
              type="text"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
          </div>

          <!-- Email -->
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              v-model="usuario.email"
              type="email"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
          </div>

          <!-- Contraseña -->
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Contraseña
            </label>
            <div class="relative">
              <input
                v-model="usuario.password"
                :type="usuario.tipo_usuario === 'cliente' || showPassword ? 'text' : 'password'"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                :readonly="usuario.tipo_usuario === 'cliente'"
                :placeholder="usuario.tipo_usuario === 'cliente' ? 'Se generará automáticamente' : 'Dejar en blanco para mantener la actual'"
              >
              <button
                v-if="usuario.tipo_usuario !== 'cliente'"
                type="button"
                class="absolute inset-y-0 right-0 px-3 flex items-center"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            
            <!-- Mensajes informativos según el tipo de usuario -->
            <p v-if="usuario.tipo_usuario === 'cliente'" class="text-sm text-gray-500 mt-1">
              La contraseña se genera automáticamente y se enviará por email
            </p>
            <p v-else class="text-sm text-gray-500 mt-1">
              La contraseña debe tener al menos:
              <ul class="list-disc pl-5 mt-1">
                <li>8 caracteres</li>
                <li>Una letra</li>
                <li>Un número</li>
              </ul>
            </p>
          </div>

          <!-- Tipo de Usuario -->
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Tipo de Usuario
            </label>
            <select
              v-model="usuario.tipo_usuario"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="administrador">Administrador</option>
              <option value="vendedor">Vendedor</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>

          <!-- Teléfono -->
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Teléfono
            </label>
            <input
              v-model="usuario.telefono"
              type="text"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
          </div>

          <!-- Empresa -->
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Empresa
            </label>
            <input
              v-model="usuario.empresa"
              type="text"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
          </div>

          <!-- NIT/Carnet -->
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              NIT/Carnet
            </label>
            <input
              v-model="usuario.ruc"
              type="text"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingrese NIT o Carnet de Identidad"
            >
          </div>

          <!-- Dirección -->
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Dirección
            </label>
            <input
              v-model="usuario.direccion"
              type="text"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
          </div>

          <!-- Estado -->
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Estado
            </label>
            <select
              v-model="usuario.estado"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <!-- Botones -->
        <div class="flex justify-end mt-6 space-x-4">
          <button
            type="button"
            @click="cancelar"
            class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="bg-[#33c7d1] text-white px-4 py-2 rounded-lg hover:bg-[#2ba3ac] transition-colors disabled:opacity-50"
          >
            {{ loading ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 