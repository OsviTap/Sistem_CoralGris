import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    isOpen: false
  }),

  getters: {
    totalItems: (state) => state.items.length,
    
    isEmpty: (state) => state.items.length === 0,
    
    subtotal: (state) => state.items.reduce((total, item) => {
      return total + (item.precio * item.cantidad)
    }, 0),
    
    total: (state) => {
      const subtotal = state.items.reduce((total, item) => {
        return total + (item.precio * item.cantidad)
      }, 0)
      // Aquí puedes agregar lógica para impuestos o descuentos
      return subtotal
    },

    // Agrupar items por tipo de precio (normal/mayoreo)
    itemsByPriceType: (state) => {
      return state.items.reduce((groups, item) => {
        const type = item.cantidad >= (item.cantidad_mayoreo || 12) ? 'mayoreo' : 'normal'
        if (!groups[type]) groups[type] = []
        groups[type].push(item)
        return groups
      }, {})
    }
  },

  actions: {
    addItem(product) {
      const existingItem = this.items.find(item => item.id === product.id)
      
      if (existingItem) {
        // Verificar que no exceda el stock
        const newQuantity = existingItem.cantidad + product.cantidad
        if (newQuantity <= product.stock) {
          existingItem.cantidad = newQuantity
        }
      } else {
        this.items.push({
          id: product.id,
          nombre: product.nombre,
          imagen_url: product.imagen_url,
          precio: product.precio,
          cantidad: product.cantidad,
          stock: product.stock
        })
      }
      
      // Guardar en localStorage
      this.saveCart()
    },

    removeItem(productId) {
      this.items = this.items.filter(item => item.id !== productId)
      this.saveCart()
    },

    updateQuantity(productId, quantity) {
      const item = this.items.find(item => item.id === productId)
      if (item && quantity <= item.stock) {
        item.cantidad = quantity
        this.saveCart()
      }
    },

    clearCart() {
      this.items = []
      this.saveCart()
    },

    toggleCart() {
      this.isOpen = !this.isOpen
      if (this.isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    },

    saveCart() {
      localStorage.setItem('cart', JSON.stringify(this.items))
    },

    loadCart() {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        this.items = JSON.parse(savedCart)
      }
    },

    // Actualizar precios según nivel de usuario
    updatePrices(nivelPrecio) {
      this.items.forEach(item => {
        // Aquí deberías hacer una llamada a la API para obtener el precio actualizado
        // según el nivel del usuario, o manejar la lógica según tu implementación
        // Por ahora solo actualizamos con el precio L1
        item.precio = item.precio_l1
      })
      this.saveCart()
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
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'cart',
        storage: localStorage
      }
    ]
  }
}) 