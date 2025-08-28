const { Pedido, DetallePedido, Producto, Usuario, Sucursal } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const emailService = require('../service/emailService');
const io = require('../config/socket');
const logger = require('../config/logger');

const pedidoController = {
  // Crear nuevo pedido
  createPedido: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
      const {
        // Datos personales
        nombre,
        apellidos,
        telefono,
        email,
        
        // Datos del pedido
        productos,
        tipo_pago,
        tipo_entrega,
        direccion_entrega,
        referencias,
        coordenadas,
        sucursal_id,
        
        // Datos de facturación
        requiere_factura,
        razon_social,
        nit,
        
        notas
      } = req.body;
      
      // Validar productos
      if (!productos || productos.length === 0) {
        return res.status(400).json({ 
          message: 'El pedido debe contener al menos un producto' 
        });
      }

      let total = 0;
      const detalles = [];

      // Verificar stock y calcular total
      for (const item of productos) {
        const producto = await Producto.findByPk(item.producto_id);
        
        if (!producto) {
          await transaction.rollback();
          return res.status(404).json({ 
            message: `Producto ${item.producto_id} no encontrado` 
          });
        }

        if (producto.stock < item.cantidad) {
          await transaction.rollback();
          return res.status(400).json({ 
            message: `Stock insuficiente para ${producto.nombre}` 
          });
        }

        // Determinar precio según cantidad y nivel de usuario
        let precio;
        const esMayorista = item.cantidad >= producto.cantidad_mayoreo;
        const esMayoristaEspecial = item.cantidad >= producto.cantidad_mayoreo_especial;

        if (req.usuario) {
          // Usuario registrado
          precio = req.usuario.nivel_precio === 'L1' ? producto.precio_l1 :
                  req.usuario.nivel_precio === 'L2' ? producto.precio_l2 :
                  req.usuario.nivel_precio === 'L3' ? producto.precio_l3 :
                  producto.precio_l4;
        } else {
          // Usuario no registrado
          precio = esMayorista ? producto.precio_l2 : producto.precio_l1;
        }

        const subtotal = precio * item.cantidad;
        total += subtotal;

        // Actualizar stock
        await producto.update({
          stock: producto.stock - item.cantidad
        }, { transaction });

        detalles.push({
          producto_id: producto.id,
          cantidad: item.cantidad,
          precio,
          subtotal
        });
      }

      // Crear pedido
      const pedido = await Pedido.create({
        cliente_id: req.usuario?.id,
        nombre,
        apellidos,
        telefono,
        email,
        tipo_pago,
        tipo_entrega,
        direccion_entrega,
        referencias,
        coordenadas,
        sucursal_id,
        requiere_factura,
        razon_social,
        nit,
        notas,
        total,
        estado: 'pendiente'
      }, { transaction });

      // Crear detalles del pedido
      await DetallePedido.bulkCreate(
        detalles.map(detalle => ({
          ...detalle,
          pedido_id: pedido.id
        })),
        { transaction }
      );

      if (req.usuario) {
        // Enviar email de confirmación solo si es usuario registrado
        await emailService.sendOrderConfirmation(pedido, req.usuario);

        // Notificar a vendedores por WebSocket
        io.to('vendedores').emit('nuevo_pedido', {
          id: pedido.id,
          cliente: req.usuario.nombre,
          total
        });
      }

      await transaction.commit();

      // Registrar en el log
      logger.info(`Nuevo pedido creado #${pedido.id}${req.usuario ? ` por usuario ${req.usuario.id}` : ''}`);

      res.status(201).json({
        message: 'Pedido creado exitosamente',
        pedido: {
          id: pedido.id,
          total,
          estado: pedido.estado
        }
      });

    } catch (error) {
      await transaction.rollback();
      logger.error('Error creando pedido:', error);
      res.status(500).json({ message: 'Error al crear el pedido' });
    }
  },

  // Obtener pedidos con filtros
  getPedidos: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        estado,
        fecha_inicio,
        fecha_fin
      } = req.query;

      const where = {};
      
      if (estado) where.estado = estado;
      if (fecha_inicio && fecha_fin) {
        where.fecha_pedido = {
          [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
        };
      }

      // Si es cliente, solo ve sus pedidos
      if (req.usuario.tipo_usuario === 'cliente') {
        where.cliente_id = req.usuario.id;
      }

      const { count, rows } = await Pedido.findAndCountAll({
        where,
        include: [
          { 
            model: Usuario,
            as: 'Cliente',
            attributes: ['id', 'nombre', 'email', 'telefono']
          },
          { 
            model: Usuario,
            as: 'Vendedor',
            attributes: ['id', 'nombre']
          },
          { 
            model: Sucursal,
            attributes: ['id', 'nombre']
          },
          {
            model: DetallePedido,
            include: [{ 
              model: Producto,
              attributes: ['id', 'nombre', 'codigo_sku']
            }]
          }
        ],
        order: [['fecha_pedido', 'DESC']],
        limit,
        offset: (page - 1) * limit
      });

      res.json({
        pedidos: rows,
        total: count,
        paginas: Math.ceil(count / limit),
        pagina_actual: parseInt(page)
      });
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  // Actualizar estado del pedido
  updateEstadoPedido: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado, vendedor_id } = req.body;

      const pedido = await Pedido.findByPk(id);
      if (!pedido) {
        return res.status(404).json({ message: 'Pedido no encontrado' });
      }

      await pedido.update({
        estado,
        vendedor_id: vendedor_id || pedido.vendedor_id
      });

      res.json({ message: 'Estado del pedido actualizado', pedido });
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  // Agregar este nuevo método
  getPedidoById: async (req, res) => {
    try {
      const { id } = req.params;

      const pedido = await Pedido.findByPk(id, {
        include: [
          {
            model: DetallePedido,
            as: 'detalles',
            include: [{
              model: Producto,
              attributes: ['id', 'nombre', 'imagen_url', 'codigo_sku']
            }]
          },
          {
            model: Usuario,
            as: 'Cliente',
            attributes: ['id', 'nombre', 'email', 'telefono']
          },
          {
            model: Sucursal,
            attributes: ['id', 'nombre', 'direccion']
          }
        ]
      });

      if (!pedido) {
        return res.status(404).json({ message: 'Pedido no encontrado' });
      }

      // Si es cliente, verificar que sea su pedido
      if (req.usuario.tipo_usuario === 'cliente' && pedido.cliente_id !== req.usuario.id) {
        return res.status(403).json({ message: 'No autorizado' });
      }

      res.json(pedido);
    } catch (error) {
      console.error('Error al obtener pedido:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
};

module.exports = pedidoController;