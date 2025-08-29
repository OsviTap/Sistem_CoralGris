const { Subcategoria, Categoria } = require('../models')

// Obtener todas las subcategorías
const getSubcategorias = async (req, res) => {
  try {
    const subcategorias = await Subcategoria.findAll({
      include: [{ model: Categoria, as: 'categoriaPadre' }],
      order: [['nombre', 'ASC']]
    })
    
    res.json(subcategorias)
  } catch (error) {
    console.error('Error al obtener subcategorías:', error)
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    })
  }
}

// Obtener subcategorías por categoría
const getSubcategoriasByCategoria = async (req, res) => {
  try {
    const { categoriaId } = req.params
    
    const subcategorias = await Subcategoria.findAll({
      where: { categoria_id: categoriaId },
      include: [{ model: Categoria, as: 'categoriaPadre' }],
      order: [['nombre', 'ASC']]
    })
    
    res.json(subcategorias)
  } catch (error) {
    console.error('Error al obtener subcategorías por categoría:', error)
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    })
  }
}

// Obtener una subcategoría por ID
const getSubcategoriaById = async (req, res) => {
  try {
    const { id } = req.params
    
    const subcategoria = await Subcategoria.findByPk(id, {
      include: [{ model: Categoria, as: 'categoriaPadre' }]
    })
    
    if (!subcategoria) {
      return res.status(404).json({ message: 'Subcategoría no encontrada' })
    }
    
    res.json(subcategoria)
  } catch (error) {
    console.error('Error al obtener subcategoría:', error)
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    })
  }
}

// Crear una nueva subcategoría
const createSubcategoria = async (req, res) => {
  try {
    const { nombre, categoria_id, estado = 'activo' } = req.body
    
    // Validar que la categoría existe
    const categoria = await Categoria.findByPk(categoria_id)
    if (!categoria) {
      return res.status(400).json({ message: 'La categoría especificada no existe' })
    }
    
    // Verificar si ya existe una subcategoría con el mismo nombre en la misma categoría
    const subcategoriaExistente = await Subcategoria.findOne({
      where: { 
        nombre: nombre,
        categoria_id: categoria_id
      }
    })
    
    if (subcategoriaExistente) {
      return res.status(400).json({ 
        message: 'Ya existe una subcategoría con ese nombre en esta categoría' 
      })
    }
    
    const subcategoria = await Subcategoria.create({
      nombre,
      categoria_id,
      estado
    })
    
    // Obtener la subcategoría con la categoría incluida
    const subcategoriaCreada = await Subcategoria.findByPk(subcategoria.id, {
      include: [{ model: Categoria, as: 'categoriaPadre' }]
    })
    
    res.status(201).json(subcategoriaCreada)
  } catch (error) {
    console.error('Error al crear subcategoría:', error)
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    })
  }
}

// Actualizar una subcategoría
const updateSubcategoria = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, categoria_id, estado } = req.body
    
    const subcategoria = await Subcategoria.findByPk(id)
    if (!subcategoria) {
      return res.status(404).json({ message: 'Subcategoría no encontrada' })
    }
    
    // Si se está cambiando la categoría, validar que existe
    if (categoria_id && categoria_id !== subcategoria.categoria_id) {
      const categoria = await Categoria.findByPk(categoria_id)
      if (!categoria) {
        return res.status(400).json({ message: 'La categoría especificada no existe' })
      }
    }
    
    // Verificar si ya existe otra subcategoría con el mismo nombre en la misma categoría
    if (nombre || categoria_id) {
      const subcategoriaExistente = await Subcategoria.findOne({
        where: { 
          nombre: nombre || subcategoria.nombre,
          categoria_id: categoria_id || subcategoria.categoria_id,
          id: { [require('sequelize').Op.ne]: id } // Excluir la subcategoría actual
        }
      })
      
      if (subcategoriaExistente) {
        return res.status(400).json({ 
          message: 'Ya existe una subcategoría con ese nombre en esta categoría' 
        })
      }
    }
    
    await subcategoria.update({
      nombre: nombre || subcategoria.nombre,
      categoria_id: categoria_id || subcategoria.categoria_id,
      estado: estado || subcategoria.estado
    })
    
    // Obtener la subcategoría actualizada con la categoría incluida
    const subcategoriaActualizada = await Subcategoria.findByPk(id, {
      include: [{ model: Categoria, as: 'categoriaPadre' }]
    })
    
    res.json(subcategoriaActualizada)
  } catch (error) {
    console.error('Error al actualizar subcategoría:', error)
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    })
  }
}

// Eliminar una subcategoría
const deleteSubcategoria = async (req, res) => {
  try {
    const { id } = req.params
    
    const subcategoria = await Subcategoria.findByPk(id)
    if (!subcategoria) {
      return res.status(404).json({ message: 'Subcategoría no encontrada' })
    }
    
    // Verificar si hay productos asociados a esta subcategoría
    const { Producto } = require('../models')
    const productosAsociados = await Producto.count({
      where: { subcategoria_id: id }
    })
    
    if (productosAsociados > 0) {
      return res.status(400).json({ 
        message: `No se puede eliminar la subcategoría porque tiene ${productosAsociados} producto(s) asociado(s)` 
      })
    }
    
    await subcategoria.destroy()
    
    res.json({ message: 'Subcategoría eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar subcategoría:', error)
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    })
  }
}

module.exports = {
  getSubcategorias,
  getSubcategoriasByCategoria,
  getSubcategoriaById,
  createSubcategoria,
  updateSubcategoria,
  deleteSubcategoria
}
