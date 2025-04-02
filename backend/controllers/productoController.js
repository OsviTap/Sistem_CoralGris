const { Producto, Categoria, Marca, ColorProducto, Venta, DetalleVenta, Pedido, DetallePedido } = require('../models');
const supabase = require('../config/supabase');
const { Op, Sequelize } = require('sequelize');
const recommendationService = require('../services/recommendationService');
const fpGrowth = require('node-fpgrowth');
const sequelize = require('../config/database');
const ProductoInteres = require('../models/ProductoInteres');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/productos');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

// Clase de error personalizada
class ProductoError extends Error {
  constructor(message, code, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

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
          }
        ],
        order,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Transformar los datos para incluir todos los precios
      const productos = rows.map(producto => ({
        ...producto.toJSON(),
        precios: {
          l1: producto.precio_l1,
          l2: producto.precio_l2,
          l3: producto.precio_l3,
          l4: producto.precio_l4
        }
      }));

      res.json({
        productos,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
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
  },

  // Obtener todos los productos con filtros
  obtenerProductos: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        categoria,
        marca,
        precioMin,
        precioMax,
        stock,
        rating,
        busqueda,
        ordenarPor = 'created_at',
        orden = 'DESC'
      } = req.query

      const offset = (page - 1) * limit
      const where = {}

      // Aplicar filtros
      if (categoria) where.categoria_id = categoria
      if (marca) where.marca_id = marca
      if (precioMin || precioMax) {
        where.precio_l1 = {}
        if (precioMin) where.precio_l1[Op.gte] = precioMin
        if (precioMax) where.precio_l1[Op.lte] = precioMax
      }
      if (stock === 'true') where.stock = { [Op.gt]: 0 }
      if (rating) where.rating = { [Op.gte]: rating }
      if (busqueda) {
        where[Op.or] = [
          { nombre: { [Op.iLike]: `%${busqueda}%` } },
          { descripcion: { [Op.iLike]: `%${busqueda}%` } },
          { codigo_sku: { [Op.iLike]: `%${busqueda}%` } }
        ]
      }

      const { count, rows } = await Producto.findAndCountAll({
        where,
        include: [
          { model: Categoria, attributes: ['nombre'] },
          { model: Marca, attributes: ['nombre'] }
        ],
        order: [[ordenarPor, orden]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      })

      // Transformar los datos para incluir todos los precios
      const productos = rows.map(producto => ({
        ...producto.toJSON(),
        precios: {
          l1: producto.precio_l1,
          l2: producto.precio_l2,
          l3: producto.precio_l3,
          l4: producto.precio_l4
        }
      }))

      res.json({
        total: count,
        totalPaginas: Math.ceil(count / limit),
        paginaActual: parseInt(page),
        productos
      })
    } catch (error) {
      console.error('Error al obtener productos:', error)
      res.status(500).json({
        error: 'Error al obtener productos',
        details: error.message
      })
    }
  },

  // Obtener un producto por ID
  obtenerProducto: async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id, {
        include: [
          { model: Categoria, attributes: ['nombre'] },
          { model: Marca, attributes: ['nombre'] }
        ]
      })

      if (!producto) {
        throw new ProductoError('Producto no encontrado', 404)
      }

      res.json(producto)
    } catch (error) {
      if (error instanceof ProductoError) {
        res.status(error.code).json({
          error: error.message,
          details: error.details
        })
      } else {
        console.error('Error al obtener producto:', error)
        res.status(500).json({
          error: 'Error al obtener producto',
          details: error.message
        })
      }
    }
  },

  // Crear nuevo producto
  crearProducto: async (req, res) => {
    try {
      const producto = await Producto.create(req.body)
      res.status(201).json(producto)
    } catch (error) {
      console.error('Error al crear producto:', error)
      res.status(500).json({
        error: 'Error al crear producto',
        details: error.message
      })
    }
  },

  // Actualizar producto
  actualizarProducto: async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id)
      if (!producto) {
        throw new ProductoError('Producto no encontrado', 404)
      }

      await producto.update(req.body)
      res.json(producto)
    } catch (error) {
      if (error instanceof ProductoError) {
        res.status(error.code).json({
          error: error.message,
          details: error.details
        })
      } else {
        console.error('Error al actualizar producto:', error)
        res.status(500).json({
          error: 'Error al actualizar producto',
          details: error.message
        })
      }
    }
  },

  // Eliminar producto
  eliminarProducto: async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id)
      if (!producto) {
        throw new ProductoError('Producto no encontrado', 404)
      }

      // Eliminar imágenes
      if (producto.imagen) {
        await fs.unlink(path.join('uploads/productos', producto.imagen))
      }
      if (producto.imagenes && producto.imagenes.length > 0) {
        for (const imagen of producto.imagenes) {
          await fs.unlink(path.join('uploads/productos', imagen))
        }
      }

      await producto.destroy()
      res.json({ message: 'Producto eliminado correctamente' })
    } catch (error) {
      if (error instanceof ProductoError) {
        res.status(error.code).json({
          error: error.message,
          details: error.details
        })
      } else {
        console.error('Error al eliminar producto:', error)
        res.status(500).json({
          error: 'Error al eliminar producto',
          details: error.message
        })
      }
    }
  },

  // Subir imágenes de producto
  subirImagenes: async (req, res) => {
    try {
      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          upload.single('imagen')(req, res, (err) => {
            if (err) reject(err)
            resolve(file.filename)
          })
        })
      })

      const imagenes = await Promise.all(uploadPromises)
      res.json({ imagenes })
    } catch (error) {
      console.error('Error al subir imágenes:', error)
      res.status(500).json({
        error: 'Error al subir imágenes',
        details: error.message
      })
    }
  },

  // Obtener productos relacionados
  obtenerProductosRelacionados: async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id)
      if (!producto) {
        throw new ProductoError('Producto no encontrado', 404)
      }

      const productosRelacionados = await Producto.findAll({
        where: {
          id: { [Op.ne]: producto.id },
          categoria_id: producto.categoria_id,
          activo: true,
          stock: { [Op.gt]: 0 }
        },
        include: [
          { model: Categoria, attributes: ['nombre'] },
          { model: Marca, attributes: ['nombre'] }
        ],
        limit: 4
      })

      res.json(productosRelacionados)
    } catch (error) {
      if (error instanceof ProductoError) {
        res.status(error.code).json({
          error: error.message,
          details: error.details
        })
      } else {
        console.error('Error al obtener productos relacionados:', error)
        res.status(500).json({
          error: 'Error al obtener productos relacionados',
          details: error.message
        })
      }
    }
  },

  // Obtener tendencias
  obtenerTendencias: async (req, res) => {
    try {
      const tendencias = await Producto.findAll({
        where: {
          activo: true,
          stock: { [Op.gt]: 0 }
        },
        include: [
          { model: Categoria, attributes: ['nombre'] },
          { model: Marca, attributes: ['nombre'] }
        ],
        order: [
          ['rating', 'DESC'],
          ['created_at', 'DESC']
        ],
        limit: 10
      })

      res.json(tendencias)
    } catch (error) {
      console.error('Error al obtener tendencias:', error)
      res.status(500).json({
        error: 'Error al obtener tendencias',
        details: error.message
      })
    }
  }
};

module.exports = productoController;