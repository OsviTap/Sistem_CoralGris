import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userNivelPrecio: (state) => state.user?.nivel_precio || 'L1'
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post('/api/auth/login', credentials)
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', this.token)
        
        // Configurar el token en axios para futuras peticiones
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al iniciar sesión'
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post('/api/auth/register', userData)
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', this.token)
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al registrarse'
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    },

    async fetchUser() {
      if (!this.token) return

      this.loading = true
      try {
        const response = await axios.get('/api/auth/user')
        this.user = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al obtener datos del usuario'
        // Si hay un error de autenticación, hacer logout
        if (error.response?.status === 401) {
          this.logout()
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateProfile(userData) {
      this.loading = true
      try {
        const response = await axios.put('/api/auth/profile', userData)
        this.user = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al actualizar perfil'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Inicializar el store
    init() {
      if (this.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        this.fetchUser()
      }
    }
  }
}) 