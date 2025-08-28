import { defineStore } from 'pinia'
import axios from '../utils/axios'

export const useCategoriaStore = defineStore('categoria', {
  state: () => ({
    categorias: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchCategorias() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('/categorias')
        this.categorias = response.data
        return this.categorias
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar las categorías'
        console.error('Error al cargar categorías:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createCategoria(categoriaData) {
      try {
        const response = await axios.post('/categorias', categoriaData)
        this.categorias.push(response.data)
        return response.data
      } catch (error) {
        console.error('Error al crear categoría:', error)
        throw error
      }
    },

    async updateCategoria(id, categoriaData) {
      try {
        const response = await axios.put(`/categorias/${id}`, categoriaData)
        const index = this.categorias.findIndex(c => c.id === id)
        if (index !== -1) {
          this.categorias[index] = response.data
        }
        return response.data
      } catch (error) {
        console.error('Error al actualizar categoría:', error)
        throw error
      }
    },

    async deleteCategoria(id) {
      try {
        await axios.delete(`/categorias/${id}`)
        this.categorias = this.categorias.filter(c => c.id !== id)
      } catch (error) {
        console.error('Error al eliminar categoría:', error)
        throw error
      }
    }
  }
}) 