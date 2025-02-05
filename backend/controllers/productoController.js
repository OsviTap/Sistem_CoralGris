const { Producto, Categoria, Marca, ColorProducto, Venta, DetalleVenta, Pedido, DetallePedido } = require('../models');
const supabase = require('../config/supabase');
const { Op, Sequelize } = require('sequelize');
const recommendationService = require('../services/recommendationService');
const fpGrowth = require('node-fpgrowth');

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
  }
};

module.exports = productoController;