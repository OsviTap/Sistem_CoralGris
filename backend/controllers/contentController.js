const { ContenidoLandingPage } = require('../models');
const supabase = require('../config/supabase');

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

      // Subir imagen a Supabase si existe
      if (req.file) {
        const file = req.file;
        // Crear ruta para carousel: libreria-images/carousel/nombre-archivo
        const filePath = `carousel/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('libreria-images')
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600'
          });

        if (uploadError) throw uploadError;

        // Obtener URL pública
        const { data: { publicUrl } } = supabase
          .storage
          .from('libreria-images')
          .getPublicUrl(filePath);

        imagen_url = publicUrl;
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
      res.status(500).json({ 
        message: 'Error en el servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
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

      // Si hay una nueva imagen, eliminar la anterior y subir la nueva
      if (req.file) {
        // Si existe una imagen anterior, eliminarla de Supabase
        if (imagen_url) {
          const oldPath = imagen_url.split('/').slice(-2).join('/'); // Obtiene 'carousel/nombre-archivo'
          const { error: deleteError } = await supabase
            .storage
            .from('libreria-images')
            .remove([oldPath]);

          if (deleteError) {
            console.error('Error al eliminar imagen anterior:', deleteError);
          }
        }

        // Subir nueva imagen
        const file = req.file;
        const filePath = `carousel/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('libreria-images')
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600'
          });

        if (uploadError) throw uploadError;

        // Obtener nueva URL pública
        const { data: { publicUrl } } = supabase
          .storage
          .from('libreria-images')
          .getPublicUrl(filePath);

        imagen_url = publicUrl;
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
      res.status(500).json({ 
        message: 'Error en el servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
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

      // Si hay imagen, eliminarla de Supabase
      if (contenido.imagen_url) {
        const filePath = contenido.imagen_url.split('/').slice(-2).join('/'); // Obtiene 'carousel/nombre-archivo'
        const { error: deleteError } = await supabase
          .storage
          .from('libreria-images')
          .remove([filePath]);

        if (deleteError) {
          console.error('Error al eliminar imagen:', deleteError);
        }
      }

      await contenido.destroy();

      res.json({ message: 'Contenido eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar contenido:', error);
      res.status(500).json({ 
        message: 'Error en el servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }
};

module.exports = contentController;