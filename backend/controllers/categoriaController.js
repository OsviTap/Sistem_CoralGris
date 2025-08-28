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
      const { nombre, descripcion, estado, subcategorias } = req.body;

      const categoria = await Categoria.create({ 
        nombre, 
        descripcion, 
        estado: estado || 'activo' 
      });

      if (subcategorias && subcategorias.length > 0) {
        await Subcategoria.bulkCreate(
          subcategorias.map(sub => ({
            nombre: sub,
            categoria_id: categoria.id
          }))
        );
      }

      const categoriaCreada = await Categoria.findByPk(categoria.id, {
        include: [{ model: Subcategoria, as: 'subcategorias' }]
      });

      res.status(201).json(categoriaCreada);
    } catch (error) {
      console.error('Error al crear categoría:', error);
      console.error('Detalles del error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // En desarrollo, mostrar más detalles del error
      if (process.env.NODE_ENV === 'development') {
        res.status(500).json({ 
          message: 'Error en el servidor',
          error: error.message,
          details: error.stack
        });
      } else {
        res.status(500).json({ message: 'Error en el servidor' });
      }
    }
  },

  // Actualizar categoría
  updateCategoria: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion, estado } = req.body;

      const categoria = await Categoria.findByPk(id);
      if (!categoria) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }

      await categoria.update({ nombre, descripcion, estado });

      res.json({ message: 'Categoría actualizada', categoria });
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  // Eliminar categoría
  deleteCategoria: async (req, res) => {
    try {
      const { id } = req.params;
      
      const categoria = await Categoria.findByPk(id);
      if (!categoria) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }

      await categoria.destroy();
      res.json({ message: 'Categoría eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
};

module.exports = categoriaController;