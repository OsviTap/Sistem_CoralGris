import { defineStore } from 'pinia'
import axios from '@/utils/axios'
import { useAuthStore } from '@/stores/auth'
import { ref, computed } from 'vue'

export const useProductoStore = defineStore('producto', () => {
  const productos = ref([])
  const categorias = ref([])
  const marcas = ref([])
  const loading = ref(false)
  const error = ref(null)
  const productosVistos = ref([])
  const productosRelacionados = ref([])
  const productoSeleccionado = ref(null)
  const authStore = useAuthStore()

  const filtros = ref({
    categoria: null,
    marca: null,
    precioMin: null,
    precioMax: null,
    stock: false,
    rating: null,
    busqueda: '',
    orden: 'DESC'
  })

  const paginacion = ref({
    paginaActual: 1,
    totalPaginas: 1,
    total: 0,
    porPagina: 12
  })

  // Computed para obtener el rol del usuario
  const rolUsuario = computed(() => authStore.user?.tipo_usuario || 'cliente')

  // Computed para obtener los niveles de precio disponibles según el rol
  const nivelesPrecioDisponibles = computed(() => {
    // Si el usuario tiene un rol, mostrar L3 y L4
    if (rolUsuario.value !== 'cliente') {
      return ['L3', 'L4']
    }
    // Si no tiene rol, mostrar L1 y L2
    return ['L1', 'L2']
  })

  const fetchProductos = async () => {
    loading.value = true
    error.value = null

    try {
      // Preparar los parámetros de la consulta
      const params = {
        page: paginacion.value.paginaActual,
        limit: paginacion.value.porPagina
      }

      // Agregar filtros solo si tienen valores válidos
      if (filtros.value.categoria && filtros.value.categoria !== null) {
        params.categoria_id = filtros.value.categoria
      }
      if (filtros.value.marca && filtros.value.marca !== null) {
        params.marca_id = filtros.value.marca
      }
      if (filtros.value.busqueda && filtros.value.busqueda.trim() !== '') {
        params.search = filtros.value.busqueda.trim()
      }
      if (filtros.value.orden && filtros.value.orden !== '') {
        params.orden = filtros.value.orden
      }

      console.log('Enviando parámetros:', params)
      console.log('Filtros actuales del store:', filtros.value)
      console.log('URL de la petición:', '/productos')
      console.log('Parámetros que se enviarán:', Object.keys(params))

      const response = await axios.get('/productos', { params })

      productos.value = response.data.productos || []
      paginacion.value = {
        paginaActual: response.data.currentPage || 1,
        totalPaginas: response.data.totalPages || 1,
        total: response.data.total || 0
      }
      
      // Transformar los productos después de cargarlos
      actualizarPrecios()
    } catch (err) {
      console.error('Error al cargar productos:', err)
      console.error('Detalles del error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      })
      error.value = err.response?.data?.message || 'Error al cargar productos'
      productos.value = [] // Asegurar que productos sea un array vacío en caso de error
    } finally {
      loading.value = false
    }
  }

  const transformarProducto = (producto) => {
    if (!producto) return null

    // Asegurarnos de que los campos estado y agotado estén sincronizados
    let agotado = producto.agotado === true
    let estado = producto.estado || (agotado ? 'inactivo' : 'activo')

    // Sincronizar los campos
    if (estado === 'inactivo' && !agotado) {
      agotado = true
    } else if (estado === 'activo' && agotado) {
      agotado = false
    }

    // Asegurar que todos los precios existan
    const precios = {
      l1: producto.precio_l1 || 0,
      l2: producto.precio_l2 || producto.precio_l1 || 0,
      l3: producto.precio_l3 || producto.precio_l2 || producto.precio_l1 || 0,
      l4: producto.precio_l4 || producto.precio_l3 || producto.precio_l2 || producto.precio_l1 || 0
    }

    // Filtrar precios según el rol
    const preciosFiltrados = {}
    if (nivelesPrecioDisponibles.value.includes('L1')) preciosFiltrados.l1 = precios.l1
    if (nivelesPrecioDisponibles.value.includes('L2')) preciosFiltrados.l2 = precios.l2
    if (nivelesPrecioDisponibles.value.includes('L3')) preciosFiltrados.l3 = precios.l3
    if (nivelesPrecioDisponibles.value.includes('L4')) preciosFiltrados.l4 = precios.l4

    // Determinar el precio actual según el rol
    let precioActual
    if (rolUsuario.value !== 'cliente') {
      // Si tiene rol, mostrar L3 por defecto
      precioActual = precios.l3 || precios.l4 || precios.l2 || precios.l1
    } else {
      // Si no tiene rol, mostrar L1 por defecto
      precioActual = precios.l1 || precios.l2
    }

    return {
      ...producto,
      agotado: agotado,
      estado: estado,
      precios: preciosFiltrados,
      precio_actual: precioActual,
      categoria: producto.categoria || { nombre: 'Sin categoría' },
      marca: producto.marca || { nombre: 'Sin marca' },
      imagen_url: producto.imagen_url || '/placeholder.png',
      nombre: producto.nombre || 'Sin nombre',
      descripcion: producto.descripcion || 'Sin descripción',
      stock: producto.stock || 0
    }
  }

  const actualizarPrecios = () => {
    productos.value = productos.value.map(transformarProducto)
  }

  const fetchProducto = async (id) => {
    try {
      const response = await axios.get(`/productos/${id}`)
      if (!response.data || !response.data.producto) {
        throw new Error('Producto no encontrado')
      }
      const producto = response.data.producto
      productoSeleccionado.value = transformarProducto(producto)
      return productoSeleccionado.value
    } catch (error) {
      console.error('Error al obtener producto:', error)
      throw error
    }
  }

  const fetchProductosRelacionados = async (categoriaId, productoActualId) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(`/productos/relacionados/${categoriaId}/${productoActualId}`)
      productosRelacionados.value = response.data
    } catch (error) {
      error.value = error.response?.data?.message || 'Error al cargar productos relacionados'
      console.error('Error al cargar productos relacionados:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchCategorias = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/categorias')
      categorias.value = response.data
      return response.data
    } catch (error) {
      error.value = error.response?.data?.message || 'Error al cargar las categorías'
      console.error('Error al cargar categorías:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchMarcas = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/marcas')
      marcas.value = response.data
      return response.data
    } catch (error) {
      error.value = error.response?.data?.message || 'Error al cargar las marcas'
      console.error('Error al cargar marcas:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const buscarProductos = async (query) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(`/productos/buscar?q=${encodeURIComponent(query)}`)
      productos.value = response.data
    } catch (error) {
      error.value = error.response?.data?.message || 'Error al buscar productos'
      console.error('Error al buscar productos:', error)
    } finally {
      loading.value = false
    }
  }

  const registrarProductoVisto = (producto) => {
    const index = productosVistos.value.findIndex(p => p.id === producto.id)
    if (index !== -1) {
      productosVistos.value.splice(index, 1)
    }
    productosVistos.value.unshift(producto)
    if (productosVistos.value.length > 10) {
      productosVistos.value.pop()
    }
    guardarProductosVistos()
  }

  const cargarProductosVistos = () => {
    const guardados = localStorage.getItem('productosVistos')
    if (guardados) {
      productosVistos.value = JSON.parse(guardados)
    }
  }

  const guardarProductosVistos = () => {
    localStorage.setItem('productosVistos', JSON.stringify(productosVistos.value))
  }

  const setPagina = (pagina) => {
    paginacion.value.paginaActual = pagina
  }

  const setFiltros = (nuevosFiltros) => {
    // Mapear los nombres de filtros del componente al store
    const filtrosMapeados = {}
    
    if (nuevosFiltros.categoria_id !== undefined) {
      // Si el valor es una cadena vacía, establecer como null para no filtrar
      filtrosMapeados.categoria = nuevosFiltros.categoria_id === '' ? null : nuevosFiltros.categoria_id
    }
    if (nuevosFiltros.marca_id !== undefined) {
      // Si el valor es una cadena vacía, establecer como null para no filtrar
      filtrosMapeados.marca = nuevosFiltros.marca_id === '' ? null : nuevosFiltros.marca_id
    }
    if (nuevosFiltros.search !== undefined) {
      filtrosMapeados.busqueda = nuevosFiltros.search || ''
    }
    if (nuevosFiltros.orden !== undefined) {
      filtrosMapeados.orden = nuevosFiltros.orden || 'DESC'
    }
    
    // Actualizar los filtros del store
    Object.assign(filtros.value, filtrosMapeados)
    paginacion.value.paginaActual = 1
    
    console.log('Filtros actualizados en el store:', filtros.value)
  }

  const resetearFiltros = () => {
    filtros.value = {
      categoria: null,
      marca: null,
      precioMin: null,
      precioMax: null,
      stock: false,
      rating: null,
      busqueda: '',
      orden: 'DESC'
    }
    paginacion.value.paginaActual = 1
    console.log('Filtros reseteados en el store:', filtros.value)
  }

  const limpiarFiltros = () => {
    resetearFiltros()
    fetchProductos()
  }

  const actualizarProducto = async (id, datosProducto) => {
    try {
      // Asegurarnos de que los campos estado y agotado estén sincronizados
      if ('estado' in datosProducto) {
        datosProducto.agotado = datosProducto.estado === 'inactivo'
      } else if ('agotado' in datosProducto) {
        datosProducto.estado = datosProducto.agotado ? 'inactivo' : 'activo'
      }

      // Crear FormData para manejar la imagen
      const formData = new FormData()

      // Agregar campos básicos
      Object.keys(datosProducto).forEach(key => {
        if (key !== 'imagen_url' && key !== 'imagenes_adicionales') {
          formData.append(key, datosProducto[key])
        }
      })

      // Manejar la imagen principal
      if (datosProducto.imagen_url instanceof File) {
        formData.append('imagen', datosProducto.imagen_url)
      } else if (typeof datosProducto.imagen_url === 'string') {
        formData.append('imagen_url', datosProducto.imagen_url)
      }

      // Manejar imágenes adicionales
      if (datosProducto.imagenes_adicionales?.length > 0) {
        datosProducto.imagenes_adicionales.forEach((imagen, index) => {
          if (imagen instanceof File) {
            formData.append('imagenes_adicionales', imagen)
          } else if (typeof imagen === 'string') {
            formData.append(`imagenes_adicionales_urls[${index}]`, imagen)
          }
        })
      }

      console.log('Enviando datos al backend:', Object.fromEntries(formData))

      const response = await axios.put(`/productos/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('Respuesta completa del backend:', response)

      // Verificar si la respuesta tiene datos
      if (!response.data || !response.data.producto) {
        throw new Error('La respuesta del servidor no contiene el producto actualizado')
      }

      const productoActualizado = response.data.producto
      const productoTransformado = transformarProducto(productoActualizado)
      
      // Actualizar el producto en la lista
      const index = productos.value.findIndex(p => p.id === id)
      if (index !== -1) {
        productos.value[index] = productoTransformado
      }
      
      // Actualizar el producto seleccionado si es el mismo
      if (productoSeleccionado.value && productoSeleccionado.value.id === id) {
        productoSeleccionado.value = productoTransformado
      }
      
      return productoTransformado
    } catch (error) {
      console.error('Error al actualizar producto:', error)
      if (error.response) {
        console.error('Detalles del error:', {
          status: error.response.status,
          data: error.response.data
        })
      }
      throw error
    }
  }

  const eliminarProducto = async (id) => {
    loading.value = true
    error.value = null
    try {
      await axios.delete(`/productos/${id}`)
      productos.value = productos.value.filter(p => p.id !== id)
    } catch (error) {
      error.value = error.response?.data?.message || 'Error al eliminar el producto'
      console.error('Error al eliminar producto:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createProducto = async (datosProducto) => {
    try {
      const formData = new FormData()
      
      // Agregar campos básicos
      Object.keys(datosProducto).forEach(key => {
        if (key !== 'imagen_url' && key !== 'imagenes_adicionales') {
          formData.append(key, datosProducto[key])
        }
      })
      
      // Agregar imagen principal
      if (datosProducto.imagen_url instanceof File) {
        formData.append('imagen', datosProducto.imagen_url)
      } else if (typeof datosProducto.imagen_url === 'string') {
        formData.append('imagen_url', datosProducto.imagen_url)
      }
      
      // Agregar imágenes adicionales
      if (datosProducto.imagenes_adicionales?.length > 0) {
        datosProducto.imagenes_adicionales.forEach((imagen, index) => {
          if (imagen instanceof File) {
            formData.append(`imagenes_adicionales[${index}]`, imagen)
          }
        })
      }

      const response = await axios.post('/productos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error al crear producto:', error)
      throw error
    }
  }

  // Inicializar el store
  const init = async () => {
    try {
      await fetchProductos()
      await fetchCategorias()
      await fetchMarcas()
    } catch (error) {
      console.error('Error al inicializar el store de productos:', error)
    }
  }

  // Llamar a init al crear el store
  init()

  const fetchProductosRecomendados = async (productoId) => {
    try {
      const response = await axios.get(`/productos/${productoId}/recomendados`)
      return response.data
    } catch (error) {
      console.error('Error al obtener productos recomendados:', error)
      throw error
    }
  }

  const fetchProductosEnOferta = async () => {
    try {
      const response = await axios.get('/productos/ofertas')
      return response.data
    } catch (error) {
      console.error('Error al obtener productos en oferta:', error)
      throw error
    }
  }

  const fetchProductoById = async (id) => {
    try {
      const response = await axios.get(`/productos/${id}`)
      return response.data.producto
    } catch (error) {
      console.error('Error al obtener producto por ID:', error)
      throw error
    }
  }

  return {
    productos,
    categorias,
    marcas,
    loading,
    error,
    productosVistos,
    productosRelacionados,
    productoSeleccionado,
    filtros,
    paginacion,
    nivelesPrecioDisponibles,
    fetchProductos,
    transformarProducto,
    actualizarPrecios,
    fetchProducto,
    fetchProductosRelacionados,
    fetchCategorias,
    fetchMarcas,
    buscarProductos,
    registrarProductoVisto,
    cargarProductosVistos,
    guardarProductosVistos,
    setPagina,
    setFiltros,
    resetearFiltros,
    limpiarFiltros,
    actualizarProducto,
    eliminarProducto,
    createProducto,
    init,
    fetchProductosRecomendados,
    fetchProductosEnOferta,
    fetchProductoById
  }
}) 