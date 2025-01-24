import { defineStore } from 'pinia'
import axios from '../utils/axios'

export const useContenidoLandingStore = defineStore('contenidoLanding', {
  state: () => ({
    carruselItems: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchCarruselContent() {
      this.loading = true
      try {
        const response = await axios.get('/content', {
          params: {
            tipo_contenido: 'carrusel'
          }
        })
        
        this.carruselItems = response.data.filter(item => 
          item.estado === 'activo' &&
          (!item.fecha_fin || new Date(item.fecha_fin) > new Date())
        ).sort((a, b) => a.orden - b.orden)
        
        this.error = null
      } catch (error) {
        this.error = error.message || 'Error al cargar el contenido del carrusel'
        console.error('Error:', error)
      } finally {
        this.loading = false
      }
    }
  }
}) 