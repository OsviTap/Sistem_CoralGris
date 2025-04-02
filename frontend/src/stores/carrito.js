import { defineStore } from 'pinia'
import axios from '../utils/axios'

export const useCarritoStore = defineStore('carrito', {
  state: () => ({
    items: [],
    loading: false,
    error: null
  }),

  getters: {
    totalItems: (state) => state.items.length,
    totalPrecio: (state) => {
      return state.items.reduce((total, item) => total + (item.precio * item.cantidad), 0)
    },
    productosCarrito: (state) => {
      return state.items.map(item => item.id)
    }
  },

  actions: {
    async obtenerProductosCarrito() {
      try {
        // Si no hay items en el carrito, retornar array vacío
        if (this.items.length === 0) {
          return []
        }

        // Obtener los IDs de los productos en el carrito
        const productosIds = this.productosCarrito

        // Obtener detalles de los productos
        const response = await axios.get('/productos', {
          params: { ids: productosIds }
        })

        return response.data
      } catch (error) {
        console.error('Error al obtener productos del carrito:', error)
        return []
      }
    },

    agregarAlCarrito(producto) {
      const itemExistente = this.items.find(item => item.id === producto.id)
      
      if (itemExistente) {
        itemExistente.cantidad++
      } else {
        this.items.push({
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 1,
          imagen: producto.imagen
        })
      }
    },

    removerDelCarrito(productoId) {
      const index = this.items.findIndex(item => item.id === productoId)
      if (index > -1) {
        this.items.splice(index, 1)
      }
    },

    actualizarCantidad(productoId, cantidad) {
      const item = this.items.find(item => item.id === productoId)
      if (item) {
        item.cantidad = Math.max(1, cantidad)
      }
    },

    limpiarCarrito() {
      this.items = []
    },

    async finalizarCompra() {
      this.loading = true
      try {
        // Aquí iría la lógica para procesar la compra
        await axios.post('/compras', {
          items: this.items
        })
        
        // Limpiar el carrito después de una compra exitosa
        this.limpiarCarrito()
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
}) 