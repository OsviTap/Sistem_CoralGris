import { defineStore } from 'pinia'
import axios from '../utils/axios'

export const useUsuarioStore = defineStore('usuario', {
  state: () => ({
    usuarios: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchUsuarios() {
      this.loading = true
      try {
        const response = await axios.get('/api/usuarios')
        this.usuarios = response.data
        return this.usuarios
      } catch (error) {
        console.error('Error al cargar usuarios:', error)
        this.error = error.response?.data?.message || 'Error al cargar usuarios'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createUsuario(usuarioData) {
      try {
        const response = await axios.post('/api/usuarios', usuarioData)
        this.usuarios.push(response.data)
        return response.data
      } catch (error) {
        console.error('Error al crear usuario:', error)
        throw error
      }
    },

    async updateUsuario(id, usuarioData) {
      try {
        const response = await axios.put(`/api/usuarios/${id}`, usuarioData)
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
        const response = await axios.put(`/api/usuarios/${id}/estado`, { estado })
        const index = this.usuarios.findIndex(u => u.id === id)
        if (index !== -1) {
          this.usuarios[index] = response.data
        }
        return response.data
      } catch (error) {
        console.error('Error al actualizar estado:', error)
        throw error
      }
    }
  }
}) 