import { defineStore } from 'pinia'
import axios from '../utils/axios'

export const useUsuarioStore = defineStore('usuario', {
  state: () => ({
    usuarios: [],
    loading: false,
    error: null,
    filtros: {
      search: '',
      tipo_usuario: '',
      estado: ''
    },
    paginacion: {
      pagina: 1,
      total: 0,
      porPagina: 10,
      totalPaginas: 0
    }
  }),

  actions: {
    async fetchUsuarios() {
      this.loading = true
      try {
        const response = await axios.get('/usuarios', {
          params: {
            ...this.filtros,
            page: this.paginacion.pagina,
            limit: this.paginacion.porPagina
          }
        })
        
        const { usuarios, total, paginas } = response.data
        this.usuarios = usuarios
        this.paginacion.total = total
        this.paginacion.totalPaginas = paginas
        return this.usuarios
      } catch (error) {
        console.error('Error al cargar usuarios:', error)
        this.error = error.response?.data?.message || 'Error al cargar usuarios'
        throw error
      } finally {
        this.loading = false
      }
    },

    setFiltros(filtros) {
      this.filtros = { ...this.filtros, ...filtros }
      this.paginacion.pagina = 1 // Reset página al filtrar
      return this.fetchUsuarios()
    },

    setPagina(pagina) {
      this.paginacion.pagina = pagina
      return this.fetchUsuarios()
    },

    async createUsuario(userData) {
      try {
        // Guardamos la contraseña original antes de enviarla al backend
        const originalPassword = userData.password

        const response = await axios.post('/usuarios/register', userData)
        if (response.data.usuario) {
          // Si es cliente, enviar las credenciales por email con la contraseña original
          if (userData.tipo_usuario === 'cliente') {
            await this.sendCredentialsByEmail(response.data.usuario.id, {
              email: userData.email,
              username: userData.email,
              password: originalPassword // Usar la contraseña original sin hashear
            })
          }
          return response.data
        }
      } catch (error) {
        console.error('Error creating usuario:', error)
        throw error
      }
    },

    async fetchUsuario(id) {
      try {
        const response = await axios.get(`/usuarios/${id}`)
        return response.data
      } catch (error) {
        console.error('Error al obtener usuario:', error)
        throw error
      }
    },

    async updateUsuario(id, usuarioData) {
      try {
        const response = await axios.put(`/usuarios/${id}`, usuarioData)
        
        // Actualizar el usuario en la lista si existe
        const index = this.usuarios.findIndex(u => u.id === id)
        if (index !== -1) {
          this.usuarios[index] = response.data
        }
        
        return response.data
      } catch (error) {
        console.error('Error al actualizar usuario:', error)
        throw error
      }
    },

    async updateEstado(id, estado) {
      try {
        const response = await axios.put(`/usuarios/${id}/estado`, { 
          estado: estado 
        })
        
        const index = this.usuarios.findIndex(u => u.id === id)
        if (index !== -1) {
          this.usuarios[index] = response.data
        }
        await this.fetchUsuarios() // Recargar la lista después de actualizar
        return response.data
      } catch (error) {
        console.error('Error al actualizar estado:', error)
        throw error
      }
    },

    async sendCredentialsByEmail(userId, credentials) {
      try {
        const response = await axios.post(`/usuarios/${userId}/send-credentials`, {
          email: credentials.email,
          username: credentials.username
        })
        return true
      } catch (error) {
        console.error('Error al enviar credenciales:', error)
        throw error
      }
    }
  }
}) 