import { defineStore } from 'pinia'
import axios from '@/utils/axios'

export const useSubcategoriaStore = defineStore('subcategoria', {
  state: () => ({
    subcategorias: [],
    loading: false,
    error: null
  }),

  getters: {
    getSubcategorias: (state) => state.subcategorias,
    getSubcategoriasByCategoria: (state) => (categoriaId) => {
      return state.subcategorias.filter(sub => sub.categoria_id === categoriaId)
    }
  },

  actions: {
    async fetchSubcategorias() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('/subcategorias')
        this.subcategorias = response.data
      } catch (error) {
        console.error('Error al cargar subcategorías:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async createSubcategoria(subcategoriaData) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post('/subcategorias', subcategoriaData)
        this.subcategorias.push(response.data)
        return response.data
      } catch (error) {
        console.error('Error al crear subcategoría:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateSubcategoria(id, subcategoriaData) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.put(`/subcategorias/${id}`, subcategoriaData)
        const index = this.subcategorias.findIndex(sub => sub.id === id)
        if (index !== -1) {
          this.subcategorias[index] = response.data
        }
        return response.data
      } catch (error) {
        console.error('Error al actualizar subcategoría:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteSubcategoria(id) {
      this.loading = true
      this.error = null
      try {
        await axios.delete(`/subcategorias/${id}`)
        this.subcategorias = this.subcategorias.filter(sub => sub.id !== id)
      } catch (error) {
        console.error('Error al eliminar subcategoría:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchSubcategoriasByCategoria(categoriaId) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get(`/subcategorias/categoria/${categoriaId}`)
        return response.data
      } catch (error) {
        console.error('Error al cargar subcategorías por categoría:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
