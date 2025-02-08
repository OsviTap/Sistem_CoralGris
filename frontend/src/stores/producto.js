import { defineStore } from 'pinia'

import axios from '../utils/axios'

export const useProductoStore = defineStore('producto', {
  state: () => ({
    productos: [],
    totalProductos: 0,
    paginaActual: 1,
    totalPaginas: 1,
    loading: false,
    error: null,
    filtros: {
      categoria: null,
      marca: null,
      busqueda: '',
      estado: 'todos'
    },
    itemsPorPagina: 12,
    productosRecomendados: [],
    loadingRecomendados: false,
    errorRecomendados: null,
    statsRecomendados: null
  }),

  actions: {
    async fetchProductos() {
      this.loading = true
      this.error = null
      this.productos = []
      
      try {
        console.log('Iniciando fetchProductos con params:', {
          ...this.filtros,
          page: this.paginaActual,
          limit: this.itemsPorPagina
        })

        const response = await axios.get('/productos', {
          params: {
            ...this.filtros,
            page: this.paginaActual,
            limit: this.itemsPorPagina
          }
        })

        console.log('Respuesta del servidor:', response.data)

        if (response.data?.productos) {
          this.productos = response.data.productos
          this.totalProductos = response.data.total || 0
          this.totalPaginas = response.data.totalPaginas || 1
          console.log(`Cargados ${this.productos.length} productos`)
        } else {
          console.warn('La respuesta no contiene productos:', response.data)
          this.productos = []
          this.totalProductos = 0
          this.totalPaginas = 1
        }
      } catch (error) {
        console.error('Error al cargar productos:', error)
        if (error.response) {
          console.error('Respuesta de error:', error.response.data)
        }
        this.error = 'Error al cargar los productos'
        this.productos = []
        this.totalProductos = 0
        this.totalPaginas = 1
      } finally {
        this.loading = false
      }
    },

    async fetchProductoById(id) {
      try {
        const response = await axios.get(`/productos/${id}`)
        return response.data
      } catch (error) {
        console.error('Error al obtener producto:', error)
        throw error
      }
    },

    async createProducto(productoData) {
      try {
        const response = await axios.post('/productos', productoData)
        return response.data
      } catch (error) {
        console.error('Error al crear producto:', error)
        throw error
      }
    },

    async updateProducto(id, productoData) {
      try {
        const response = await axios.put(`/productos/${id}`, productoData)
        return response.data
      } catch (error) {
        console.error('Error al actualizar producto:', error)
        throw error
      }
    },

    async deleteProducto(id) {
      try {
        await axios.delete(`/productos/${id}`)
        this.productos = this.productos.filter(p => p.id !== id)
      } catch (error) {
        console.error('Error al eliminar producto:', error)
        throw error
      }
    },

    setFiltros(nuevosFiltros) {
      this.filtros = {
        ...this.filtros,
        ...nuevosFiltros
      }
      this.paginaActual = 1 // Resetear paginación al filtrar
    },

    setPagina(pagina) {
      this.paginaActual = pagina
    },

    async fetchProductosRecomendados({ categoria_id, exclude_id, limit = 8 }) {
      try {
        const response = await axios.get('/productos/recomendados', {
          params: {
            categoria_id,
            exclude_id,
            limit
          }
        });
        return response.data;
      } catch (error) {
        console.error('Store: Error recomendados:', error);
        throw error;
      }
    }
  },

  getters: {
    recomendacionesStats: (state) => state.statsRecomendados || {
      patrones: 0,
      categoria: 0,
      marca: 0
    }
  }
}) 