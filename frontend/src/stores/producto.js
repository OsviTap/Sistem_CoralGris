import { defineStore } from 'pinia'

import axios from '../utils/axios'

export const useProductoStore = defineStore('producto', {
  state: () => ({
    productos: [],
    totalProductos: 0,
    paginaActual: 1,
    totalPaginas: 1,
    filtros: {
      categoria_id: null,
      marca_id: null,
      search: '',
      orden: ''
    },
    loading: false,
    itemsPorPagina: 12,
    error: null,
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
          page: this.paginaActual,
          limit: this.itemsPorPagina,
          ...this.filtros
        })

        const response = await axios.get('/productos', {
          params: {
            page: this.paginaActual,
            limit: this.itemsPorPagina,
            ...this.filtros
          }
        })

        console.log('Respuesta del servidor:', response.data)

        if (response.data?.productos) {
          this.productos = response.data.productos
          this.totalProductos = response.data.total || 0
          this.totalPaginas = response.data.paginas || 1
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

    setFiltros(filtros) {
      this.filtros = { ...this.filtros, ...filtros }
      this.paginaActual = 1
      this.fetchProductos()
    },

    setPagina(pagina) {
      this.paginaActual = pagina
      this.fetchProductos()
    },

    resetFiltros() {
      this.filtros = {
        categoria_id: null,
        marca_id: null,
        search: '',
        orden: ''
      }
      this.paginaActual = 1
      this.fetchProductos()
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
    },

    async fetchProductoById(id) {
      try {
        const response = await axios.get(`/productos/${id}`)
        return response.data.producto
      } catch (error) {
        console.error('Error al obtener producto:', error)
        throw error
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