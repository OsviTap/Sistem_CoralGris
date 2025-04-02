import { defineStore } from 'pinia'
import axios from 'axios'

export const useProductoStore = defineStore('producto', {
  state: () => ({
    productos: [],
    categorias: [],
    marcas: [],
    loading: false,
    error: null,
    productosVistos: [],
    productosRelacionados: [],
    productoSeleccionado: null,
    filtros: {
      categoria: null,
      marca: null,
      precioMin: null,
      precioMax: null,
      stock: null,
      rating: null,
      busqueda: null,
      ordenarPor: 'created_at',
      orden: 'DESC'
    },
    paginacion: {
      paginaActual: 1,
      totalPaginas: 1,
      total: 0,
      porPagina: 12
    }
  }),

  getters: {
    productosActivos: (state) => {
      return state.productos.filter(p => p.activo)
    },

    productosFiltrados: (state) => {
      let productos = [...state.productos]

      // Aplicar filtros
      if (state.filtros.categoria) {
        productos = productos.filter(p => p.categoria_id === state.filtros.categoria)
      }
      if (state.filtros.marca) {
        productos = productos.filter(p => p.marca_id === state.filtros.marca)
      }
      if (state.filtros.precioMin) {
        productos = productos.filter(p => p.precio_l1 >= state.filtros.precioMin)
      }
      if (state.filtros.precioMax) {
        productos = productos.filter(p => p.precio_l1 <= state.filtros.precioMax)
      }
      if (state.filtros.stock) {
        productos = productos.filter(p => p.stock > 0)
      }
      if (state.filtros.rating) {
        productos = productos.filter(p => p.rating >= state.filtros.rating)
      }
      if (state.filtros.busqueda) {
        const busqueda = state.filtros.busqueda.toLowerCase()
        productos = productos.filter(p => 
          p.nombre.toLowerCase().includes(busqueda) ||
          p.descripcion.toLowerCase().includes(busqueda) ||
          p.codigo_sku?.toLowerCase().includes(busqueda)
        )
      }

      // Ordenar
      if (state.filtros.ordenarPor) {
        productos.sort((a, b) => {
          const aVal = a[state.filtros.ordenarPor]
          const bVal = b[state.filtros.ordenarPor]
          const orden = state.filtros.orden === 'DESC' ? -1 : 1
          return aVal > bVal ? orden : -orden
        })
      }

      return productos
    },

    productosEnOferta: (state) => {
      return state.productosActivos.filter(p => p.descuento > 0)
    },

    productosTendencia: (state) => {
      return state.productosActivos
        .filter(p => p.rating >= 4 && p.stock > 0)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 8)
    }
  },

  actions: {
    async fetchProductos() {
      try {
        this.loading = true
        this.error = null

        const params = {
          page: this.paginacion.paginaActual,
          limit: this.paginacion.porPagina,
          ...this.filtros
        }

        const response = await axios.get('/api/productos', { params })
        
        // Transformar los datos para asegurar que todos los campos necesarios existan
        this.productos = response.data.productos.map(producto => ({
          ...producto,
          precios: {
            l1: producto.precio_l1 || 0,
            l2: producto.precio_l2 || 0,
            l3: producto.precio_l3 || 0,
            l4: producto.precio_l4 || 0
          },
          categoria: producto.categoria || { nombre: 'Sin categoría' },
          marca: producto.marca || { nombre: 'Sin marca' },
          imagen_url: producto.imagen_url || '/placeholder.png',
          nombre: producto.nombre || 'Sin nombre',
          descripcion: producto.descripcion || 'Sin descripción',
          stock: producto.stock || 0,
          agotado: producto.stock <= 0
        }))

        this.paginacion = {
          ...this.paginacion,
          totalPaginas: response.data.totalPaginas,
          total: response.data.total
        }
      } catch (error) {
        console.error('Error al cargar productos:', error)
        this.error = error.response?.data?.message || 'Error al cargar los productos'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchProducto(id) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get(`/api/productos/${id}`)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar el producto'
        console.error('Error al cargar producto:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchProductosRelacionados(categoriaId, productoActualId) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get(`/api/productos/relacionados/${categoriaId}/${productoActualId}`)
        this.productosRelacionados = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar productos relacionados'
        console.error('Error al cargar productos relacionados:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchCategorias() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('/api/categorias')
        this.categorias = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar las categorías'
        console.error('Error al cargar categorías:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchMarcas() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('/api/marcas')
        this.marcas = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar las marcas'
        console.error('Error al cargar marcas:', error)
      } finally {
        this.loading = false
      }
    },

    async buscarProductos(query) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get(`/api/productos/buscar?q=${encodeURIComponent(query)}`)
        this.productos = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al buscar productos'
        console.error('Error al buscar productos:', error)
      } finally {
        this.loading = false
      }
    },

    registrarProductoVisto(producto) {
      const index = this.productosVistos.findIndex(p => p.id === producto.id)
      if (index !== -1) {
        this.productosVistos.splice(index, 1)
      }
      this.productosVistos.unshift(producto)
      if (this.productosVistos.length > 10) {
        this.productosVistos.pop()
      }
      this.guardarProductosVistos()
    },

    cargarProductosVistos() {
      const guardados = localStorage.getItem('productosVistos')
      if (guardados) {
        this.productosVistos = JSON.parse(guardados)
      }
    },

    guardarProductosVistos() {
      localStorage.setItem('productosVistos', JSON.stringify(this.productosVistos))
    },

    setPagina(pagina) {
      this.paginacion.paginaActual = pagina
    },

    setFiltros(filtros) {
      this.filtros = { ...this.filtros, ...filtros }
      this.paginacion.paginaActual = 1
    },

    resetearFiltros() {
      this.filtros = {
        categoria: null,
        marca: null,
        precioMin: null,
        precioMax: null,
        stock: null,
        rating: null,
        busqueda: null,
        ordenarPor: 'created_at',
        orden: 'DESC'
      }
      this.paginacion.paginaActual = 1
    },

    async actualizarProducto(id, datos) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.put(`/api/productos/${id}`, datos)
        const index = this.productos.findIndex(p => p.id === id)
        if (index !== -1) {
          this.productos[index] = response.data
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al actualizar el producto'
        console.error('Error al actualizar producto:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async eliminarProducto(id) {
      this.loading = true
      this.error = null
      try {
        await axios.delete(`/api/productos/${id}`)
        this.productos = this.productos.filter(p => p.id !== id)
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al eliminar el producto'
        console.error('Error al eliminar producto:', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
}) 