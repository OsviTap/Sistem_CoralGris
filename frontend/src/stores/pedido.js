import { defineStore } from 'pinia'
import axios from '../utils/axios'
import { useAuthStore } from './auth'

export const usePedidoStore = defineStore('pedido', {
  state: () => ({
    pedidos: [],
    pedidoActual: null,
    loading: false,
    error: null,
    success: false,
    paginacion: {
      pagina: 1,
      total: 0,
      porPagina: 10,
      totalPaginas: 0
    },
    filtros: {
      estado: null,
      fechaInicio: null,
      fechaFin: null
    }
  }),

  actions: {
    async crearPedido(datosPedido) {
      const authStore = useAuthStore()
      this.loading = true
      this.error = null
      this.success = false

      try {
        const endpoint = authStore.isAuthenticated ? '/api/pedidos' : '/api/pedidos/guest'
        const response = await axios.post(endpoint, datosPedido)
        this.pedidoActual = response.data.pedido
        this.success = true
        return response.data
      } catch (error) {
        console.error('Error al crear pedido:', error)
        this.error = error.response?.data?.message || 'Error al procesar el pedido'
        throw error
      } finally {
        this.loading = false
      }
    },

    async obtenerPedidos(params = {}) {
      this.loading = true
      this.error = null

      try {
        const queryParams = new URLSearchParams({
          page: params.pagina || this.paginacion.pagina,
          limit: params.porPagina || this.paginacion.porPagina,
          ...(this.filtros.estado && { estado: this.filtros.estado }),
          ...(this.filtros.fechaInicio && { fecha_inicio: this.filtros.fechaInicio }),
          ...(this.filtros.fechaFin && { fecha_fin: this.filtros.fechaFin })
        })

        const response = await axios.get(`/api/pedidos?${queryParams}`)
        
        this.pedidos = response.data.pedidos
        this.paginacion = {
          pagina: response.data.pagina_actual,
          total: response.data.total,
          porPagina: this.paginacion.porPagina,
          totalPaginas: response.data.paginas
        }
        return this.pedidos
      } catch (error) {
        console.error('Error al obtener pedidos:', error)
        this.error = error.response?.data?.message || 'Error al cargar los pedidos'
        throw error
      } finally {
        this.loading = false
      }
    },

    async obtenerPedido(id) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.get(`/api/pedidos/${id}`)
        this.pedidoActual = response.data
        return response.data
      } catch (error) {
        console.error('Error al obtener pedido:', error)
        this.error = error.response?.data?.message || 'Error al cargar el pedido'
        throw error
      } finally {
        this.loading = false
      }
    },

    limpiarPedidoActual() {
      this.pedidoActual = null
      this.error = null
      this.success = false
    },

    setFiltros(nuevosFiltros) {
      this.filtros = {
        ...this.filtros,
        ...nuevosFiltros
      }
      this.paginacion.pagina = 1
      return this.obtenerPedidos()
    },

    setPagina(pagina) {
      this.paginacion.pagina = pagina
      return this.obtenerPedidos()
    },

    async actualizarEstadoPedido(pedidoId, nuevoEstado) {
      try {
        this.loading = true
        this.error = null
        
        const response = await axios.put(`/api/pedidos/${pedidoId}/estado`, {
          estado: nuevoEstado
        })

        const index = this.pedidos.findIndex(p => p.id === pedidoId)
        if (index !== -1) {
          this.pedidos[index] = response.data.pedido
        }

        if (this.pedidoActual?.id === pedidoId) {
          this.pedidoActual = response.data.pedido
        }

        return response.data
      } catch (error) {
        console.error('Error al actualizar estado:', error)
        this.error = error.response?.data?.message || 'Error al actualizar el estado'
        throw error
      } finally {
        this.loading = false
      }
    }
  },

  getters: {
    pedidosPendientes: (state) => {
      return state.pedidos.filter(p => p.estado === 'pendiente')
    },

    pedidosEnProceso: (state) => {
      return state.pedidos.filter(p => 
        ['confirmado', 'en_preparacion', 'en_camino'].includes(p.estado)
      )
    },

    pedidosCompletados: (state) => {
      return state.pedidos.filter(p => p.estado === 'entregado')
    },

    pedidosCancelados: (state) => {
      return state.pedidos.filter(p => p.estado === 'cancelado')
    },

    hayError: (state) => !!state.error,
    
    hayPedidoActual: (state) => !!state.pedidoActual,

    pedidosFiltrados: (state) => {
      return state.pedidos.filter(pedido => {
        if (state.filtros.estado && pedido.estado !== state.filtros.estado) {
          return false
        }
        return true
      })
    }
  }
}) 