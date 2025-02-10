const { Usuario, Sucursal } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { sendEmail } = require('../config/email');

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

  // Obtener un usuario por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findByPk(id, {
        include: [{ 
          model: Sucursal,
          attributes: ['id', 'nombre']
        }],
        attributes: { exclude: ['password'] }
      });

      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json(usuario);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ message: 'Error al obtener el usuario' });
    }
  },

  // Actualizar usuario
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Si hay password, encriptarlo
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      } else {
        delete updateData.password;
      }

      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      await usuario.update(updateData);

      // Obtener usuario actualizado con sus relaciones
      const usuarioActualizado = await Usuario.findByPk(id, {
        include: [{ 
          model: Sucursal,
          attributes: ['id', 'nombre']
        }],
        attributes: { exclude: ['password'] }
      });

      res.json(usuarioActualizado);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ 
        message: 'Error al actualizar el usuario',
        error: error.message 
      });
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
      // Primero intentamos sin la relación para ver si ese es el problema
      const usuario = await Usuario.findByPk(req.usuario.id, {
        attributes: { 
          exclude: ['password'],
          include: [
            'id',
            'nombre',
            'email',
            'tipo_usuario',
            'sucursal_id',
            'telefono',
            'empresa',
            'ruc',
            'direccion',
            'nivel_precio',
            'estado'
          ]
        }
      });

      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json(usuario);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  // Actualizar perfil del usuario
  updateProfile: async (req, res) => {
    try {
      const {
        nombre,
        email,
        telefono,
        empresa,
        ruc,
        direccion
      } = req.body;

      const usuario = await Usuario.findByPk(req.usuario.id);
      
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

      await usuario.update({
        nombre,
        email,
        telefono,
        empresa,
        ruc,
        direccion
      });

      // Obtener usuario actualizado con sus relaciones
      const usuarioActualizado = await Usuario.findByPk(req.usuario.id, {
        include: [{ model: Sucursal }],
        attributes: { exclude: ['password'] }
      });

      res.json(usuarioActualizado);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  // Actualizar estado del usuario
  updateEstado: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!['activo', 'inactivo'].includes(estado)) {
        return res.status(400).json({ 
          message: 'Estado inválido. Debe ser "activo" o "inactivo"' 
        });
      }

      const usuario = await Usuario.findByPk(id);
      
      if (!usuario) {
        return res.status(404).json({ 
          message: 'Usuario no encontrado' 
        });
      }

      await usuario.update({ estado });

      // Excluir el password de la respuesta
      const usuarioResponse = usuario.toJSON();
      delete usuarioResponse.password;

      res.json(usuarioResponse);
    } catch (error) {
      console.error('Error al actualizar estado del usuario:', error);
      res.status(500).json({ 
        message: 'Error al actualizar el estado del usuario' 
      });
    }
  },

  // Crear usuario desde el panel de administración
  createUser: async (req, res) => {
    try {
      const { 
        nombre, 
        email, 
        password,
        tipo_usuario,
        empresa,
        ruc,
        telefono,
        direccion,
        nivel_precio,
        sucursal_id,
        estado = 'activo'
      } = req.body;

      // Validar campos requeridos
      if (!nombre || !email || !password) {
        return res.status(400).json({ 
          message: 'Nombre, email y password son requeridos' 
        });
      }

      // Verificar si el email ya existe
      const usuarioExiste = await Usuario.findOne({ where: { email } });
      if (usuarioExiste) {
        return res.status(400).json({ 
          message: 'El email ya está registrado' 
        });
      }

      // Encriptar password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      const usuario = await Usuario.create({
        nombre,
        email,
        password: hashedPassword,
        tipo_usuario,
        empresa,
        ruc,
        telefono,
        direccion,
        nivel_precio,
        sucursal_id,
        estado
      });

      // Obtener usuario creado con sus relaciones
      const usuarioCreado = await Usuario.findByPk(usuario.id, {
        include: [{ 
          model: Sucursal,
          attributes: ['id', 'nombre']
        }],
        attributes: { exclude: ['password'] }
      });

      res.status(201).json(usuarioCreado);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ 
        message: 'Error al crear el usuario',
        error: error.message 
      });
    }
  },

  sendCredentials: async (req, res) => {
    try {
      const { id } = req.params;
      const { email } = req.body;

      // Buscar usuario
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Generar nueva contraseña
      const newPassword = `CG${usuario.nombre.substring(0, 3)}${Math.random().toString(36).substring(2, 6)}`;
      
      // Hashear y actualizar contraseña en la base de datos
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await usuario.update({ password: hashedPassword });

      // Enviar email con las nuevas credenciales
      await sendEmail({
        to: email,
        subject: 'Tus credenciales de acceso - Coral Gris',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Credenciales de Acceso</h1>
            <p>Tus credenciales de acceso al sistema son:</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Usuario:</strong> ${email}</p>
              <p><strong>Contraseña:</strong> ${newPassword}</p>
            </div>
            <p>Por seguridad, te recomendamos cambiar tu contraseña después de iniciar sesión.</p>
          </div>
        `
      });

      res.json({ message: 'Credenciales enviadas exitosamente' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error al enviar credenciales' });
    }
  },
};

module.exports = userController;