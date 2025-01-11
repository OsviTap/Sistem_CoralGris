const { Producto, Categoria, Marca, ColorProducto } = require('../models');
const { uploadImage } = require('../utils/storage');

const productoController = {
  // Obtener productos con filtros y paginación
  getProductos: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 12,
        categoria_id,
        marca_id,
        search,
        orden
      } = req.query;

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

      const { count, rows } = await Producto.findAndCountAll({
        where,
        include: [
          { model: Categoria },
          { model: Marca },
          { model: ColorProducto }
        ],
        order,
        limit,
        offset
      });

      res.json({
        productos: rows,
        total: count,
        paginas: Math.ceil(count / limit),
        pagina_actual: parseInt(page)
      });
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ message: 'Error en el servidor' });
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
      if (req.file) {
        imagen_url = await uploadImage(req.file, 'products');
      }

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
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
};

module.exports = productoController;