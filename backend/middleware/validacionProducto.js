const { Op } = require('sequelize')
const Producto = require('../models/Producto')

const validarProductoMiddleware = async (req, res, next) => {
  try {
    const { nombre, precio, stock, sku, categoria_id } = req.body

    // Validar campos requeridos
    if (!nombre || !precio || stock === undefined || !sku || !categoria_id) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        details: {
          nombre: !nombre ? 'El nombre es requerido' : null,
          precio: !precio ? 'El precio es requerido' : null,
          stock: stock === undefined ? 'El stock es requerido' : null,
          sku: !sku ? 'El SKU es requerido' : null,
          categoria_id: !categoria_id ? 'La categoría es requerida' : null
        }
      })
    }

    // Validar longitud del nombre
    if (nombre.length < 3 || nombre.length > 100) {
      return res.status(400).json({
        error: 'El nombre debe tener entre 3 y 100 caracteres'
      })
    }

    // Validar precio
    if (precio <= 0) {
      return res.status(400).json({
        error: 'El precio debe ser mayor a 0'
      })
    }

    // Validar stock
    if (stock < 0) {
      return res.status(400).json({
        error: 'El stock no puede ser negativo'
      })
    }

    // Validar SKU único
    const skuExistente = await Producto.findOne({
      where: {
        sku,
        ...(req.params.id && { id: { [Op.ne]: req.params.id } })
      }
    })

    if (skuExistente) {
      return res.status(400).json({
        error: 'El SKU ya está en uso'
      })
    }

    // Validar imágenes si se proporcionan
    if (req.body.imagenes) {
      if (!Array.isArray(req.body.imagenes)) {
        return res.status(400).json({
          error: 'Las imágenes deben ser un array'
        })
      }

      if (req.body.imagenes.length > 5) {
        return res.status(400).json({
          error: 'No se pueden subir más de 5 imágenes'
        })
      }
    }

    // Validar fechas de descuento si se proporcionan
    if (req.body.fecha_inicio_descuento && req.body.fecha_fin_descuento) {
      const inicio = new Date(req.body.fecha_inicio_descuento)
      const fin = new Date(req.body.fecha_fin_descuento)

      if (inicio >= fin) {
        return res.status(400).json({
          error: 'La fecha de inicio del descuento debe ser anterior a la fecha de fin'
        })
      }
    }

    // Validar descuento si se proporciona
    if (req.body.descuento) {
      if (req.body.descuento < 0 || req.body.descuento > 100) {
        return res.status(400).json({
          error: 'El descuento debe estar entre 0 y 100'
        })
      }
    }

    next()
  } catch (error) {
    console.error('Error en validación de producto:', error)
    res.status(500).json({
      error: 'Error en la validación del producto',
      details: error.message
    })
  }
}

module.exports = validarProductoMiddleware 