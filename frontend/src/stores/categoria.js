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
      try {
        const response = await axios.get('/categorias')
        this.categorias = response.data
        this.error = null
      } catch (error) {
        this.error = error.message || 'Error al cargar categorías'
        console.error('Error:', error)
      } finally {
        this.loading = false
      }
    }
  }
}) 