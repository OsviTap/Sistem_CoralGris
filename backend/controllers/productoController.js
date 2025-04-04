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
      const datosActualizacion = { ...req.body };

      console.log('Datos recibidos para actualizar producto:', datosActualizacion);
      console.log('Archivos recibidos:', {
        imagen: req.files?.imagen,
        imagenes_adicionales: req.files?.imagenes_adicionales
      });

      const producto = await Producto.findByPk(id);
      
      if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      // Si se está actualizando el estado o agotado
      if (datosActualizacion.estado !== undefined) {
        datosActualizacion.agotado = datosActualizacion.estado === 'inactivo';
      } else if (datosActualizacion.agotado !== undefined) {
        datosActualizacion.estado = datosActualizacion.agotado ? 'inactivo' : 'activo';
      }

      // Manejar la imagen principal si se proporciona
      if (req.files?.imagen?.[0]) {
        const file = req.files.imagen[0];
        
        // Si existe una imagen anterior, eliminarla de Supabase
        if (producto.imagen_url) {
          const oldPath = producto.imagen_url.split('/').slice(-2).join('/');
          const { error: deleteError } = await supabase
            .storage
            .from('libreria-images')
            .remove([oldPath]);

          if (deleteError) {
            console.error('Error al eliminar imagen anterior:', deleteError);
          }
        }

        // Subir nueva imagen
        const filePath = `productos/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

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

        datosActualizacion.imagen_url = publicUrl;
      }

      // Manejar imágenes adicionales
      let imagenesAdicionales = [];
      
      // Si hay imágenes adicionales existentes, mantenerlas
      if (producto.imagenes_adicionales) {
        imagenesAdicionales = [...producto.imagenes_adicionales];
      }

      // Si se proporcionan nuevas imágenes adicionales
      if (req.files?.imagenes_adicionales?.length > 0) {
        // Eliminar imágenes anteriores si se solicita
        if (datosActualizacion.eliminar_imagenes_anteriores) {
          for (const imagenUrl of imagenesAdicionales) {
            const oldPath = imagenUrl.split('/').slice(-2).join('/');
            const { error: deleteError } = await supabase
              .storage
              .from('libreria-images')
              .remove([oldPath]);

            if (deleteError) {
              console.error('Error al eliminar imagen adicional anterior:', deleteError);
            }
          }
          imagenesAdicionales = [];
        }

        // Subir nuevas imágenes adicionales
        for (const file of req.files.imagenes_adicionales) {
          const filePath = `productos/adicionales/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

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

          imagenesAdicionales.push(publicUrl);
        }
      }

      // Asignar las imágenes adicionales al objeto de actualización
      datosActualizacion.imagenes_adicionales = imagenesAdicionales;

      // Convertir campos numéricos
      if (datosActualizacion.precio_l1) datosActualizacion.precio_l1 = Number(datosActualizacion.precio_l1);
      if (datosActualizacion.precio_l2) datosActualizacion.precio_l2 = Number(datosActualizacion.precio_l2);
      if (datosActualizacion.precio_l3) datosActualizacion.precio_l3 = Number(datosActualizacion.precio_l3);
      if (datosActualizacion.precio_l4) datosActualizacion.precio_l4 = Number(datosActualizacion.precio_l4);
      if (datosActualizacion.cantidad_mayoreo) datosActualizacion.cantidad_mayoreo = Number(datosActualizacion.cantidad_mayoreo);

      // Eliminar campos que no deben actualizarse directamente
      delete datosActualizacion.created_at;
      delete datosActualizacion.updated_at;
      delete datosActualizacion.categoria;
      delete datosActualizacion.marca;
      delete datosActualizacion.precios;
      delete datosActualizacion.precio_actual;
      delete datosActualizacion.eliminar_imagenes_anteriores;

      console.log('Datos a actualizar:', datosActualizacion);

      await producto.update(datosActualizacion);

      const productoActualizado = await Producto.findByPk(id, {
        include: [
          { 
            model: Categoria,
            as: 'categoria'
          },
          { 
            model: Marca,
            as: 'marca'
          }
        ]
      });

      res.json({
        producto: productoActualizado,
        message: 'Producto actualizado exitosamente'
      });

    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({ 
        message: 'Error al actualizar el producto',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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
  },

  // Obtener productos recomendados basados en categoría y marca
  getProductosRecomendadosBasadosEnCategoria: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Obtener el producto actual
      const producto = await Producto.findByPk(id, {
        include: [
          { model: Categoria, as: 'categoria' },
          { model: Marca, as: 'marca' }
        ]
      });
      
      if (!producto) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      // Buscar productos de la misma categoría o marca, excluyendo el producto actual
      const productosRecomendados = await Producto.findAll({
        where: {
          id: { [Op.ne]: id },
          [Op.or]: [
            { categoria_id: producto.categoria_id },
            { marca_id: producto.marca_id }
          ],
          agotado: false
        },
        include: [
          { model: Categoria, as: 'categoria' },
          { model: Marca, as: 'marca' }
        ],
        limit: 4
      });

      res.json(productosRecomendados);
    } catch (error) {
      console.error('Error al obtener productos recomendados:', error);
      res.status(500).json({ message: 'Error al obtener productos recomendados' });
    }
  },

  // Obtener productos en oferta
  getProductosEnOferta: async (req, res) => {
    try {
      const productosEnOferta = await Producto.findAll({
        where: {
          precio_l2: {
            [Op.ne]: null,
            [Op.lt]: Sequelize.col('precio_l1')
          },
          agotado: false
        },
        include: [
          { model: Categoria, as: 'categoria' },
          { model: Marca, as: 'marca' }
        ],
        limit: 6
      });

      res.json(productosEnOferta);
    } catch (error) {
      console.error('Error al obtener productos en oferta:', error);
      res.status(500).json({ message: 'Error al obtener productos en oferta' });
    }
  }
};

module.exports = productoController;