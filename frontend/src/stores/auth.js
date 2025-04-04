import { defineStore } from 'pinia'
import axios from '@/utils/axios'
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useProductoStore } from '@/stores/producto'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.tipo_usuario === 'administrador')
  const isVendedor = computed(() => user.value?.tipo_usuario === 'vendedor')
  const isCliente = computed(() => user.value?.tipo_usuario === 'cliente')
  const canAccessDashboard = computed(() => ['administrador', 'vendedor'].includes(user.value?.tipo_usuario))

  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      console.log('Intentando iniciar sesión con:', credentials)
      const response = await axios.post('/auth/login', credentials)
      console.log('Respuesta del servidor:', response.data)
      
      if (response.data.token) {
        user.value = response.data.usuario
        token.value = response.data.token
        
        localStorage.setItem('token', token.value)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`

        // Actualizar precios de productos
        const productoStore = useProductoStore()
        // Recargar productos después del login
        await productoStore.fetchProductos()
        productoStore.actualizarPrecios()

        // Actualizar precios del carrito
        const cartStore = useCartStore()
        cartStore.updatePrices(user.value.nivel_precio)

        return { success: true, user: response.data.usuario }
      } else {
        throw new Error('No se recibió el token de autenticación')
      }
    } catch (err) {
      console.error('Error en login:', err)
      error.value = err.response?.data?.message || 'Error en la autenticación'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      // Limpiar datos del usuario
      user.value = null
      token.value = null
      
      // Limpiar localStorage
      localStorage.removeItem('token')
      
      // Limpiar headers de axios
      delete axios.defaults.headers.common['Authorization']
      
      // Limpiar carrito
      const cartStore = useCartStore()
      cartStore.clearCart()
      
      // Redirigir al login
      window.location.href = '/login'
      
      return true
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      throw error
    }
  }

  const register = async (userData) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post('/usuarios/register', userData)
      user.value = response.data.user
      token.value = response.data.token
      
      localStorage.setItem('token', token.value)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`

      return { success: true, user: response.data.user }
    } catch (err) {
      error.value = err.response?.data?.message || 'Error en el registro'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const fetchUser = async () => {
    if (!token.value) return

    loading.value = true
    try {
      const response = await axios.get('/usuarios/profile')
      user.value = response.data
    } catch (err) {
      if (err.response?.status === 401) {
        logout()
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (userData) => {
    try {
      const response = await axios.put('/usuarios/profile', userData)
      user.value = response.data
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      throw error
    }
  }

  const init = async () => {
    if (token.value) {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
        await fetchUser()
      } catch (error) {
        console.error('Error al inicializar auth:', error)
        if (error.response?.status === 401) {
          await logout()
        }
      }
    }
  }

  // Inicializar el token en axios si existe
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    fetchUser()
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isVendedor,
    isCliente,
    canAccessDashboard,
    login,
    logout,
    register,
    fetchUser,
    updateProfile,
    init
  }
}) 