const { Producto, Categoria, Marca, ColorProducto } = require('../models');
const supabase = require('../config/supabase');
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');
const recommendationService = require('../services/recommendationService');

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
        imagen_url
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
          { model: Categoria },
          { model: Marca },
          { model: ColorProducto }
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
        imagen_url
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
        marca_id,
        exclude_id,
        limit = 8
      } = req.query;

      // 1. Obtener productos frecuentemente comprados juntos usando FP-Growth
      const frequentlyBoughtWith = await recommendationService.getFrequentItemsets(exclude_id);
      
      // 2. Obtener productos por diferentes criterios
      const [fpProducts, categoryProducts, brandProducts] = await Promise.all([
        // Productos del análisis FP-Growth (40% del total)
        Producto.findAll({
          where: {
            id: { [Op.in]: frequentlyBoughtWith },
            stock: { [Op.gt]: 0 }
          },
          limit: Math.floor(limit * 0.4)
        }),

        // Productos de la misma categoría (30% del total)
        Producto.findAll({
          where: {
            categoria_id,
            id: { [Op.ne]: exclude_id },
            stock: { [Op.gt]: 0 }
          },
          order: [['ventas_totales', 'DESC']],
          limit: Math.floor(limit * 0.3)
        }),

        // Productos de la misma marca (30% del total)
        Producto.findAll({
          where: {
            marca_id,
            id: { [Op.ne]: exclude_id },
            stock: { [Op.gt]: 0 }
          },
          order: [['created_at', 'DESC']],
          limit: Math.floor(limit * 0.3)
        })
      ]);

      // Combinar y procesar resultados
      const allProducts = [
        ...fpProducts.map(p => ({
          ...p.toJSON(),
          recommendationType: 'frequently_bought',
          confidence: frequentlyBoughtWith.find(item => item.id === p.id)?.support || 0
        })),
        ...categoryProducts.map(p => ({
          ...p.toJSON(),
          recommendationType: 'same_category'
        })),
        ...brandProducts.map(p => ({
          ...p.toJSON(),
          recommendationType: 'same_brand'
        }))
      ];

      // Eliminar duplicados y ordenar por relevancia
      const uniqueProducts = Array.from(
        new Set(allProducts.map(p => p.id))
      ).map(id => {
        const product = allProducts.find(p => p.id === id);
        return {
          ...product,
          relevanceScore: 
            product.recommendationType === 'frequently_bought' ? 3 :
            product.recommendationType === 'same_category' ? 2 : 1
        };
      });

      // Ordenar por relevancia y aleatorizar dentro de cada grupo
      const recommendations = uniqueProducts
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);

      res.json({
        status: 'success',
        productos: recommendations,
        metadata: {
          totalAnalyzed: allProducts.length,
          fromFPGrowth: fpProducts.length,
          fromCategory: categoryProducts.length,
          fromBrand: brandProducts.length
        }
      });

    } catch (error) {
      console.error('Error en recomendaciones:', error);
      res.status(500).json({
        message: 'Error al obtener productos recomendados',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = productoController;