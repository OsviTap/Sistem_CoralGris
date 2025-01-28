import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    isOpen: false
  }),

  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.cantidad, 0),
    
    subtotal: (state) => state.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
    
    total: (state) => state.subtotal,

    isEmpty: (state) => state.items.length === 0
  },

  actions: {
    addItem(producto) {
      const existingItem = this.items.find(item => item.id === producto.id)
      
      if (existingItem) {
        // Verificar stock antes de incrementar
        if (existingItem.cantidad < producto.stock) {
          existingItem.cantidad++
        }
      } else {
        this.items.push({
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen_url: producto.imagen_url,
          cantidad: 1,
          stock: producto.stock
        })
      }

      // Guardar en localStorage
      this.saveToLocalStorage()
      
      // Abrir el carrito
      this.isOpen = true
    },

    removeItem(productId) {
      const index = this.items.findIndex(item => item.id === productId)
      if (index > -1) {
        this.items.splice(index, 1)
        this.saveToLocalStorage()
      }
    },

    updateQuantity(productId, cantidad) {
      const item = this.items.find(item => item.id === productId)
      if (item) {
        if (cantidad <= item.stock && cantidad > 0) {
          item.cantidad = cantidad
          this.saveToLocalStorage()
        }
      }
    },

    clearCart() {
      this.items = []
      this.saveToLocalStorage()
    },

    toggleCart() {
      this.isOpen = !this.isOpen
    },

    saveToLocalStorage() {
      localStorage.setItem('cart', JSON.stringify(this.items))
    },

    loadFromLocalStorage() {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        this.items = JSON.parse(savedCart)
      }
    },

    async checkout() {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        throw new Error('Debe iniciar sesión para realizar la compra')
      }

      // Aquí iría la lógica para procesar la compra
      // Por ejemplo, enviar los items al backend
      
      // Limpiar carrito después de la compra exitosa
      this.clearCart()
    }
  }
}) 