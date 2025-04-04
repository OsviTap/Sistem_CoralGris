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
    }
  }
}) 