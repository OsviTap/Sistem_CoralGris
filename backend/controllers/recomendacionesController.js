const { InteraccionUsuario, CategoriaEmergente, PatronInteraccion } = require('../models')
const { Op } = require('sequelize')
const sequelize = require('../config/database')

// Función auxiliar para validar datos
const validarInteraccion = (datos) => {
  const { categoria, opcion, productosVistos, productosComprados } = datos
  
  if (!categoria || !opcion) {
    throw new Error('Categoría y opción son requeridos')
  }
  
  if (!Array.isArray(productosVistos) || !Array.isArray(productosComprados)) {
    throw new Error('Los productos deben ser arrays')
  }
  
  if (productosVistos.length > 10 || productosComprados.length > 10) {
    throw new Error('Demasiados productos en la interacción')
  }
  
  return true
}

// Función auxiliar para analizar patrones
const analizarPatrones = async (categoria, opcion, productosVistos, productosComprados) => {
  try {
    // Analizar productos vistos juntos
    const productosVistosFrecuentes = await InteraccionUsuario.findAll({
      where: {
        categoria,
        opcion,
        productos_vistos: {
          [Op.overlap]: productosVistos
        }
      },
      attributes: ['productos_vistos'],
      group: ['productos_vistos'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 3
    })

    // Analizar productos comprados juntos
    const productosCompradosFrecuentes = await InteraccionUsuario.findAll({
      where: {
        categoria,
        opcion,
        productos_comprados: {
          [Op.overlap]: productosComprados
        }
      },
      attributes: ['productos_comprados'],
      group: ['productos_comprados'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 3
    })

    // Combinar patrones
    const patronesCombinados = [...new Set([
      ...productosVistosFrecuentes.flatMap(p => p.productos_vistos),
      ...productosCompradosFrecuentes.flatMap(p => p.productos_comprados)
    ])]

    // Crear o actualizar categoría emergente
    if (patronesCombinados.length >= 2) {
      await CategoriaEmergente.upsert({
        categoria,
        opcion,
        productos_relacionados: patronesCombinados,
        frecuencia: patronesCombinados.length,
        activo: true,
        ultima_actualizacion: new Date()
      })
    }

    // Actualizar patrones de interacción
    await PatronInteraccion.upsert({
      categoria,
      opcion,
      productos_relacionados: patronesCombinados,
      frecuencia: patronesCombinados.length,
      ultima_actualizacion: new Date()
    })

    return patronesCombinados
  } catch (error) {
    console.error('Error al analizar patrones:', error)
    throw error
  }
}

const recomendacionesController = {
  // Registrar nueva interacción
  registrarInteraccion: async (req, res) => {
    try {
      const { categoria, opcion, productosVistos, productosComprados } = req.body
      
      // Validar datos
      validarInteraccion({ categoria, opcion, productosVistos, productosComprados })
      
      // Guardar interacción
      await InteraccionUsuario.create({
        categoria,
        opcion,
        productos_vistos: productosVistos || [],
        productos_comprados: productosComprados || [],
        fecha: new Date()
      })

      // Analizar patrones
      const patrones = await analizarPatrones(categoria, opcion, productosVistos || [], productosComprados || [])
      
      res.json({ 
        message: 'Interacción registrada',
        patrones
      })
    } catch (error) {
      console.error('Error al registrar interacción:', error)
      res.status(500).json({ 
        error: 'Error al registrar interacción', 
        details: error.message 
      })
    }
  },

  // Obtener patrones de interacción
  obtenerPatrones: async (req, res) => {
    try {
      const { categoria } = req.query
      
      // Obtener patrones más frecuentes
      const patrones = await PatronInteraccion.findAll({
        where: { 
          categoria,
          frecuencia: { [Op.gt]: 0 }
        },
        attributes: ['opcion', 'productos_relacionados', 'frecuencia'],
        group: ['opcion'],
        order: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'DESC'],
          ['frecuencia', 'DESC']
        ],
        limit: 5
      })

      res.json(patrones)
    } catch (error) {
      console.error('Error al obtener patrones:', error)
      res.status(500).json({ 
        error: 'Error al obtener patrones', 
        details: error.message 
      })
    }
  },

  // Obtener categorías emergentes
  obtenerCategoriasEmergentes: async (req, res) => {
    try {
      // Primero, verificar si hay categorías emergentes
      const count = await CategoriaEmergente.count()
      
      // Si no hay categorías, crear algunas por defecto
      if (count === 0) {
        await CategoriaEmergente.bulkCreate([
          {
            categoria: 'Regalo',
            opcion: 'Regalos para niños',
            productos_relacionados: [],
            frecuencia: 1,
            activo: true,
            ultima_actualizacion: new Date()
          },
          {
            categoria: 'Oficina',
            opcion: 'Material de oficina básico',
            productos_relacionados: [],
            frecuencia: 1,
            activo: true,
            ultima_actualizacion: new Date()
          },
          {
            categoria: 'Escuela',
            opcion: 'Útiles escolares básicos',
            productos_relacionados: [],
            frecuencia: 1,
            activo: true,
            ultima_actualizacion: new Date()
          }
        ])
      }

      // Obtener categorías activas
      const categorias = await CategoriaEmergente.findAll({
        where: { 
          activo: true,
          frecuencia: { [Op.gt]: 0 }
        },
        order: [
          ['frecuencia', 'DESC'],
          ['ultima_actualizacion', 'DESC']
        ],
        limit: 5
      })

      res.json(categorias || [])
    } catch (error) {
      console.error('Error al obtener categorías emergentes:', error)
      res.status(500).json([])
    }
  },

  // Actualizar categoría emergente
  actualizarCategoriaEmergente: async (req, res) => {
    try {
      const { id } = req.params
      const { activo, frecuencia, productos_relacionados } = req.body

      const categoria = await CategoriaEmergente.findByPk(id)
      if (!categoria) {
        return res.status(404).json({ error: 'Categoría no encontrada' })
      }

      await categoria.update({
        activo,
        frecuencia,
        productos_relacionados,
        ultima_actualizacion: new Date()
      })

      res.json(categoria)
    } catch (error) {
      console.error('Error al actualizar categoría emergente:', error)
      res.status(500).json({ 
        error: 'Error al actualizar categoría emergente', 
        details: error.message 
      })
    }
  }
}

module.exports = recomendacionesController 