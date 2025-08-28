const { Marca } = require('../models');

const marcaController = {
  // Obtener todas las marcas
  getMarcas: async (req, res) => {
    try {
      const marcas = await Marca.findAll({
        attributes: ['id', 'nombre'],
        order: [['nombre', 'ASC']]
      });

      res.json(marcas);
    } catch (error) {
      console.error('Error al obtener marcas:', error);
      res.status(500).json({ 
        message: 'Error en el servidor',
        error: error.message 
      });
    }
  },

  // Crear nueva marca
  createMarca: async (req, res) => {
    try {
      const { nombre, descripcion, pais_origen, estado } = req.body;
      const marca = await Marca.create({ 
        nombre, 
        descripcion, 
        pais_origen, 
        estado: estado || 'activo' 
      });
      res.status(201).json(marca);
    } catch (error) {
      console.error('Error al crear marca:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  // Actualizar marca
  updateMarca: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion, pais_origen, estado } = req.body;
      
      const marca = await Marca.findByPk(id);
      if (!marca) {
        return res.status(404).json({ message: 'Marca no encontrada' });
      }

      await marca.update({ 
        nombre, 
        descripcion, 
        pais_origen, 
        estado 
      });

      res.json(marca);
    } catch (error) {
      console.error('Error al actualizar marca:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  // Eliminar marca
  deleteMarca: async (req, res) => {
    try {
      const { id } = req.params;
      
      const marca = await Marca.findByPk(id);
      if (!marca) {
        return res.status(404).json({ message: 'Marca no encontrada' });
      }

      await marca.destroy();
      res.json({ message: 'Marca eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar marca:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
};

module.exports = marcaController; 