const { Categoria, Subcategoria } = require('../models');

const categoriaController = {
  // Obtener todas las categorías con sus subcategorías
  getCategorias: async (req, res) => {
    try {
      const categorias = await Categoria.findAll({
        include: [{
          model: Subcategoria,
          as: 'subcategorias'
        }],
        order: [
          ['nombre', 'ASC'],
          [{ model: Subcategoria, as: 'subcategorias' }, 'nombre', 'ASC']
        ]
      });

      res.json(categorias);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({ 
        message: 'Error en el servidor',
        error: error.message 
      });
    }
  },

  // Crear nueva categoría
  createCategoria: async (req, res) => {
    try {
      const { nombre, subcategorias } = req.body;

      const categoria = await Categoria.create({ nombre });

      if (subcategorias && subcategorias.length > 0) {
        await Subcategoria.bulkCreate(
          subcategorias.map(sub => ({
            nombre: sub,
            categoria_id: categoria.id
          }))
        );
      }

      const categoriaCreada = await Categoria.findByPk(categoria.id, {
        include: [{ model: Subcategoria }]
      });

      res.status(201).json(categoriaCreada);
    } catch (error) {
      console.error('Error al crear categoría:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  // Actualizar categoría
  updateCategoria: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre } = req.body;

      const categoria = await Categoria.findByPk(id);
      if (!categoria) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }

      await categoria.update({ nombre });

      res.json({ message: 'Categoría actualizada', categoria });
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
};

module.exports = categoriaController;