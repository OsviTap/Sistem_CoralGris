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
      const { nombre } = req.body;
      const marca = await Marca.create({ nombre });
      res.status(201).json(marca);
    } catch (error) {
      console.error('Error al crear marca:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
};

module.exports = marcaController; 