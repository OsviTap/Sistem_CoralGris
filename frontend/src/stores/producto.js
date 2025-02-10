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
    statsRecomendados: null,
    paginacion: {
      total: 0,
      pagina: 1,
      porPagina: 10
    },
    promociones: {
      activa: false,
      fechaInicio: null,
      fechaFin: null,
      tipo: null, // 'porcentaje', 'monto_fijo'
      valor: 0,
      categorias_aplicables: [], // IDs de categorías con descuento
      productos_aplicables: [], // IDs de productos específicos
      descripcion: ''
    }
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
        console.log('ID del producto:', id)
        console.log('Datos a actualizar:', productoData)
        
        // Cambiar la ruta para usar el endpoint específico de estado
        const response = await axios.put(`/productos/${id}/estado`, {
          estado: productoData.estado,
          agotado: productoData.agotado
        })
        
        console.log('Respuesta del servidor:', response.data)
        
        // Actualizar el producto en el estado local
        const index = this.productos.findIndex(p => p.id === id)
        if (index !== -1) {
          this.productos[index] = { 
            ...this.productos[index], 
            estado: productoData.estado,
            agotado: productoData.agotado
          }
        }
        
        return response.data
      } catch (error) {
        console.error('Error detallado:', {
          mensaje: error.message,
          respuesta: error.response?.data,
          estado: error.response?.status,
          config: error.config
        })
        throw error.response?.data || error
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
    },

    async configurarPromocion(datosPromocion) {
      try {
        const response = await axios.post('/productos/promociones', datosPromocion)
        this.promociones = response.data
        return response.data
      } catch (error) {
        console.error('Error al configurar promoción:', error)
        throw error
      }
    },

    async desactivarPromocion() {
      try {
        await axios.delete('/productos/promociones/actual')
        this.promociones.activa = false
      } catch (error) {
        console.error('Error al desactivar promoción:', error)
        throw error
      }
    },

    calcularPrecioConPromocion(producto) {
      if (!this.promociones.activa) return producto.precio_l1

      const fechaActual = new Date()
      const fechaInicio = new Date(this.promociones.fechaInicio)
      const fechaFin = new Date(this.promociones.fechaFin)

      if (fechaActual < fechaInicio || fechaActual > fechaFin) {
        return producto.precio_l1
      }

      // Verificar si el producto aplica para la promoción
      const aplicaPromocion = 
        this.promociones.productos_aplicables.includes(producto.id) ||
        this.promociones.categorias_aplicables.includes(producto.categoria_id)

      if (!aplicaPromocion) return producto.precio_l1

      if (this.promociones.tipo === 'porcentaje') {
        return producto.precio_l1 * (1 - this.promociones.valor / 100)
      } else {
        return producto.precio_l1 - this.promociones.valor
      }
    },

    async searchProductos(query) {
      try {
        const response = await axios.get('/productos', {
          params: { 
            busqueda: query,
            limit: 10
          }
        })
        return response.data.productos || []
      } catch (error) {
        console.error('Error al buscar productos:', error)
        throw error
      }
    },

    async registrarInteresProducto(productoId) {
      try {
        const response = await axios.post(`/productos/${productoId}/interes`)
        return response.data
      } catch (error) {
        console.error('Error al registrar interés:', error)
        throw error
      }
    },

    async fetchProductosConInteres() {
      try {
        const response = await axios.get('/productos/sin-stock/interes')
        return response.data
      } catch (error) {
        console.error('Error al obtener productos con interés:', error)
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