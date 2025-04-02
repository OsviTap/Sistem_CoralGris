import { defineStore } from 'pinia'
import axios from '../utils/axios'

export const useRecomendacionesStore = defineStore('recomendaciones', {
  state: () => ({
    patronesInteraccion: {},
    recomendacionesPopulares: [],
    categoriasEmergentes: [],
    loading: false,
    error: null,
    ultimaActualizacion: null
  }),

  getters: {
    categoriasActivas: (state) => {
      return state.categoriasEmergentes.filter(cat => cat.activo)
    },
    categoriasPopulares: (state) => {
      return state.categoriasEmergentes
        .filter(cat => cat.activo)
        .sort((a, b) => b.frecuencia - a.frecuencia)
        .slice(0, 5)
    }
  },

  actions: {
    async registrarInteraccion(datos) {
      this.loading = true
      this.error = null
      
      try {
        // Validar datos
        if (!datos.categoria || !datos.opcion) {
          throw new Error('Categoría y opción son requeridos')
        }

        if (!Array.isArray(datos.productosVistos) || !Array.isArray(datos.productosComprados)) {
          throw new Error('Los productos deben ser arrays')
        }

        if (datos.productosVistos.length > 10 || datos.productosComprados.length > 10) {
          throw new Error('Demasiados productos en la interacción')
        }

        // Registrar interacción
        await axios.post('/recomendaciones/interaccion', datos)
        
        // Actualizar categorías emergentes después de registrar
        await this.actualizarCategoriasEmergentes()
      } catch (error) {
        this.error = error.message
        console.error('Error al registrar interacción:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async obtenerRecomendaciones(categoria) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get('/recomendaciones/patrones', {
          params: { categoria }
        })
        
        // Actualizar patrones en el estado
        this.patronesInteraccion[categoria] = response.data
        
        return response.data
      } catch (error) {
        this.error = error.message
        console.error('Error al obtener recomendaciones:', error)
        return []
      } finally {
        this.loading = false
      }
    },

    async actualizarCategoriasEmergentes() {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get('/recomendaciones/categorias-emergentes')
        this.categoriasEmergentes = response.data
        this.ultimaActualizacion = new Date()
      } catch (error) {
        this.error = error.message
        console.error('Error al actualizar categorías:', error)
        this.categoriasEmergentes = []
      } finally {
        this.loading = false
      }
    },

    async actualizarPatronesInteraccion() {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get('/recomendaciones/patrones')
        this.patronesInteraccion = response.data
      } catch (error) {
        this.error = error.message
        console.error('Error al actualizar patrones:', error)
      } finally {
        this.loading = false
      }
    },

    limpiarError() {
      this.error = null
    },

    reset() {
      this.patronesInteraccion = {}
      this.recomendacionesPopulares = []
      this.categoriasEmergentes = []
      this.loading = false
      this.error = null
      this.ultimaActualizacion = null
    }
  }
}) 