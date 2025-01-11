const { ContenidoLandingPage } = require('../models');
const { uploadImage, deleteImage } = require('../utils/storage');

const contentController = {
  // Obtener contenido del landing page
  getContent: async (req, res) => {
    try {
      const { tipo_contenido } = req.query;
      const where = { estado: 'activo' };
      
      if (tipo_contenido) {
        where.tipo_contenido = tipo_contenido;
      }

      const contenido = await ContenidoLandingPage.findAll({
        where,
        order: [
          ['orden', 'ASC'],
          ['fecha_inicio', 'DESC']
        ]
      });

      res.json(contenido);
    } catch (error) {
      console.error('Error al obtener contenido:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  // Crear nuevo contenido
  createContent: async (req, res) => {
    try {
      const {
        tipo_contenido,
        titulo,
        contenido,
        orden,
        fecha_inicio,
        fecha_fin
      } = req.body;

      let imagen_url = null;
      if (req.file) {
        imagen_url = await uploadImage(req.file, 'content');
      }

      const nuevoContenido = await ContenidoLandingPage.create({
        tipo_contenido,
        titulo,
        contenido,
        imagen_url,
        orden,
        fecha_inicio,
        fecha_fin,
        estado: 'activo'
      });

      res.status(201).json(nuevoContenido);
    } catch (error) {
      console.error('Error al crear contenido:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  // Actualizar contenido
  updateContent: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        tipo_contenido,
        titulo,
        contenido,
        orden,
        fecha_inicio,
        fecha_fin,
        estado
      } = req.body;

      const contenidoExistente = await ContenidoLandingPage.findByPk(id);
      if (!contenidoExistente) {
        return res.status(404).json({ message: 'Contenido no encontrado' });
      }

      let imagen_url = contenidoExistente.imagen_url;
      if (req.file) {
        if (imagen_url) {
          await deleteImage(imagen_url);
        }
        imagen_url = await uploadImage(req.file, 'content');
      }

      await contenidoExistente.update({
        tipo_contenido,
        titulo,
        contenido,
        imagen_url,
        orden,
        fecha_inicio,
        fecha_fin,
        estado
      });

      res.json(contenidoExistente);
    } catch (error) {
      console.error('Error al actualizar contenido:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  // Eliminar contenido
  deleteContent: async (req, res) => {
    try {
      const { id } = req.params;
      
      const contenido = await ContenidoLandingPage.findByPk(id);
      if (!contenido) {
        return res.status(404).json({ message: 'Contenido no encontrado' });
      }

      if (contenido.imagen_url) {
        await deleteImage(contenido.imagen_url);
      }

      await contenido.destroy();

      res.json({ message: 'Contenido eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar contenido:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
};

module.exports = contentController;