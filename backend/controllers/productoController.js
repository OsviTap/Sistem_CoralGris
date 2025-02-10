const { Producto, Categoria, Marca, ColorProducto, Venta, DetalleVenta, Pedido, DetallePedido } = require('../models');
const supabase = require('../config/supabase');
const { Op, Sequelize } = require('sequelize');
const recommendationService = require('../services/recommendationService');
const fpGrowth = require('node-fpgrowth');
const sequelize = require('../config/database');
const ProductoInteres = require('../models/ProductoInteres');

const productoController = {
  // Obtener productos con filtros y paginación
  getProductos: async (req, res) => {
    try {
      console.log('Iniciando getProductos...'); // Debug log
      const {
        page = 1,
        limit = 12,
        categoria_id,
        marca_id,
        search,
        orden
      } = req.query;

      console.log('Parámetros recibidos:', { page, limit, categoria_id, marca_id, search, orden }); // Debug log

      const offset = (page - 1) * limit;
      const where = {};

      if (categoria_id) where.categoria_id = categoria_id;
      if (marca_id) where.marca_id = marca_id;
      if (search) {
        where[Op.or] = [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { descripcion: { [Op.iLike]: `%${search}%` } }
        ];
      }

      let order = [['created_at', 'DESC']];
      if (orden === 'precio_asc') order = [['precio_l1', 'ASC']];
      if (orden === 'precio_desc') order = [['precio_l1', 'DESC']];

      console.log('Consulta a realizar:', { where, order, limit, offset }); // Debug log

      const { count, rows } = await Producto.findAndCountAll({
        where,
        include: [
          { 
            model: Categoria,
            as: 'categoria',
            required: false
          },
          { 
            model: Marca,
            as: 'marca',
            required: false
          },
          { 
            model: ColorProducto,
            as: 'colores',
            required: false
          }
        ],
        order,
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true // Para evitar duplicados por los joins
      });

      console.log(`Productos encontrados: ${count}`); // Debug log
      if (rows.length > 0) {
        console.log('Primer producto:', rows[0].toJSON()); // Debug log del primer producto
      }

      res.json({
        productos: rows,
        total: count,
        paginas: Math.ceil(count / limit),
        pagina_actual: parseInt(page)
      });
    } catch (error) {
      console.error('Error detallado en getProductos:', error);
      res.status(500).json({ 
        message: 'Error en el servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Crear nuevo producto
  createProducto: async (req, res) => {
    try {
      const {
        nombre,
        descripcion,
        categoria_id,
        subcategoria_id,
        marca_id,
        precio_l1,
        precio_l2,
        precio_l3,
        precio_l4,
        stock,
        codigo_sku,
        colores
      } = req.body;

      let imagen_url = null;

      // Subir imagen a Supabase si existe
      if (req.file) {
        const file = req.file;
        const filePath = `productos/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

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

      // Crear producto en la base de datos
      const producto = await Producto.create({
        nombre,
        descripcion,
        categoria_id,
        marca_id,
        precio_l1,
        precio_l2,
        precio_l3,
        precio_l4,
        stock,
        codigo_sku,
        imagen_url,
        subcategoria_id
      });


      if (colores && colores.length > 0) {
        await ColorProducto.bulkCreate(
          colores.map(color => ({
            producto_id: producto.id,
            ...color
          }))
        );
      }

      const productoCreado = await Producto.findByPk(producto.id, {
        include: [
          { 
            model: Categoria,
            as: 'categoria'
          },
          { 
            model: Marca,
            as: 'marca'
          },
          { 
            model: ColorProducto,
            as: 'colores'
          }
        ]
      });

      res.status(201).json(productoCreado);
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({
        message: 'Error al crear el producto',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  },

  // Actualizar producto
  updateProducto: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        nombre,
        descripcion,
        categoria_id,
        subcategoria_id,
        marca_id,
        precio_l1,
        precio_l2,
        precio_l3,
        precio_l4,
        stock,

        codigo_sku,
        colores
      } = req.body;

      const producto = await Producto.findByPk(id);
      
      if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      let imagen_url = producto.imagen_url;
      if (req.file) {
        imagen_url = await uploadImage(req.file, 'productos');
      }

      await producto.update({
        nombre,
        descripcion,
        categoria_id,
        marca_id,
        precio_l1,
        precio_l2,
        precio_l3,
        precio_l4,
        stock,
        codigo_sku,
        imagen_url,
        subcategoria_id
      });


      if (colores) {
        // Eliminar colores anteriores
        await ColorProducto.destroy({
          where: { producto_id: id }
        });

        // Crear nuevos colores
        if (colores.length > 0) {
          await ColorProducto.bulkCreate(
            colores.map(color => ({
              producto_id: id,
              ...color
            }))
          );
        }
      }

      const productoActualizado = await Producto.findByPk(id, {
        include: [
          { model: Categoria },
          { model: Marca },
          { model: ColorProducto }
        ]
      });

      res.json(productoActualizado);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({ message: 'Error al actualizar el producto' });
    }
  },

  // Obtener productos recomendados
  getProductosRecomendados: async (req, res) => {
    try {
      const { 
        categoria_id, 
        exclude_id, 
        limit = 8 
      } = req.query;

      const where = {
        estado: 'activo'
      };

      if (categoria_id) {
        where.categoria_id = categoria_id;
      }

      if (exclude_id) {
        where.id = {
          [Op.ne]: exclude_id
        };
      }

      const productos = await Producto.findAll({
        where,
        include: [
          {
            model: Categoria,
            as: 'categoria',
            attributes: ['nombre']
          },
          {
            model: Marca,
            as: 'marca',
            attributes: ['nombre']
          }
        ],
        limit: parseInt(limit),
        order: Sequelize.literal('RANDOM()') // Cambiado a literal para PostgreSQL
      });

      res.json(productos);
    } catch (error) {
      console.error('Error al obtener productos recomendados:', error);
      res.status(500).json({ 
        message: 'Error al obtener productos recomendados',
        error: error.message 
      });
    }
  },

  // Obtener producto por ID
  getProductoById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const producto = await Producto.findByPk(id, {
        include: [
          { 
            model: Categoria,
            as: 'categoria'
          },
          { 
            model: Marca,
            as: 'marca'
          },
          { 
            model: ColorProducto,
            as: 'colores'
          }
        ]
      });

      if (!producto) {
        return res.status(404).json({ 
          message: 'Producto no encontrado' 
        });
      }

      res.json({
        producto,
        message: 'Producto encontrado exitosamente'
      });
    } catch (error) {
      console.error('Error al obtener producto por ID:', error);
      res.status(500).json({ 
        message: 'Error al obtener el producto',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Actualizar estado del producto
  updateProductoEstado: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado, agotado } = req.body;

      const producto = await Producto.findByPk(id);
      
      if (!producto) {
        return res.status(404).json({ 
          message: 'Producto no encontrado' 
        });
      }

      // Actualizar solo los campos de estado
      await producto.update({
        estado,
        agotado
      });

      const productoActualizado = await Producto.findByPk(id, {
        include: [
          { model: Categoria, as: 'categoria' },
          { model: Marca, as: 'marca' },
          { model: ColorProducto, as: 'colores' }
        ]
      });

      res.json({
        producto: productoActualizado,
        message: 'Estado del producto actualizado exitosamente'
      });

    } catch (error) {
      console.error('Error al actualizar estado del producto:', error);
      res.status(500).json({ 
        message: 'Error al actualizar el estado del producto',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Registrar interés
  registrarInteres: async (req, res) => {
    try {
      const { id } = req.params;
      const clienteIP = req.ip;
      
      // Verificar si ya registró interés en las últimas 24 horas
      const interesReciente = await ProductoInteres.findOne({
        where: {
          producto_id: id,
          ip_cliente: clienteIP,
          created_at: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      });

      if (interesReciente) {
        return res.status(429).json({
          message: 'Ya has registrado tu interés por este producto recientemente'
        });
      }

      // Registrar nuevo interés
      await ProductoInteres.create({
        producto_id: id,
        ip_cliente: clienteIP
      });

      // Obtener el total de registros únicos para este producto
      const totalInteres = await ProductoInteres.count({
        where: { 
          producto_id: id,
          created_at: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // últimos 30 días
          }
        },
        distinct: true,
        col: 'ip_cliente'
      });

      res.json({
        message: 'Interés registrado exitosamente',
        total_interesados: totalInteres
      });
    } catch (error) {
      console.error('Error al registrar interés:', error);
      res.status(500).json({ 
        message: 'Error al registrar interés',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  getProductosConInteres: async (req, res) => {
    try {
      const productos = await Producto.findAll({
        where: {
          estado: 'inactivo'
        },
        include: [
          { 
            model: ProductoInteres,
            as: 'interes',
            attributes: ['contador']
          },
          { 
            model: Categoria,
            as: 'categoria'
          },
          {
            model: Marca,
            as: 'marca'
          }
        ],
        order: [
          [sequelize.col('interes.contador'), 'DESC']
        ]
      });

      const productosFormateados = productos.map(producto => ({
        ...producto.toJSON(),
        interes_count: producto.interes?.contador || 0
      }));

      res.json(productosFormateados);
    } catch (error) {
      console.error('Error al obtener productos con interés:', error);
      res.status(500).json({ 
        message: 'Error al obtener productos con interés',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = productoController;