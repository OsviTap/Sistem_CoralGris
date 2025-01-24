const { Usuario, Sucursal } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

const userController = {
  // Obtener usuarios con filtros
  getUsers: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        tipo_usuario,
        search,
        estado
      } = req.query;

      const where = {};
      
      if (tipo_usuario) where.tipo_usuario = tipo_usuario;
      if (estado) where.estado = estado;
      if (search) {
        where[Op.or] = [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { empresa: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Usuario.findAndCountAll({
        where,
        include: [{ 
          model: Sucursal,
          attributes: ['id', 'nombre']
        }],
        attributes: { exclude: ['password'] },
        order: [['created_at', 'DESC']],
        limit,
        offset: (page - 1) * limit
      });

      res.json({
        usuarios: rows,
        total: count,
        paginas: Math.ceil(count / limit),
        pagina_actual: parseInt(page)
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  // Actualizar usuario
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        nombre,
        email,
        telefono,
        empresa,
        ruc,
        direccion,
        nivel_precio,
        sucursal_id,
        estado,
        password
      } = req.body;

      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Verificar si el email ya existe en otro usuario
      if (email !== usuario.email) {
        const emailExiste = await Usuario.findOne({ where: { email } });
        if (emailExiste) {
          return res.status(400).json({ message: 'El email ya está en uso' });
        }
      }

      const updateData = {
        nombre,
        email,
        telefono,
        empresa,
        ruc,
        direccion,
        nivel_precio,
        sucursal_id,
        estado
      };

      // Si se proporciona nueva contraseña, hashearla
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      await usuario.update(updateData);

      const usuarioActualizado = await Usuario.findByPk(id, {
        include: [{ model: Sucursal }],
        attributes: { exclude: ['password'] }
      });

      res.json(usuarioActualizado);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  // Cambiar contraseña
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.usuario.id;

      const usuario = await Usuario.findByPk(userId);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const validPassword = await bcrypt.compare(currentPassword, usuario.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Contraseña actual incorrecta' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await usuario.update({ password: hashedPassword });

      res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  // Obtener perfil del usuario actual
  getProfile: async (req, res) => {
    try {
      const usuario = await Usuario.findByPk(req.usuario.id, {
        include: [{ model: Sucursal }],
        attributes: { exclude: ['password'] }
      });

      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json(usuario);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
};

module.exports = userController;