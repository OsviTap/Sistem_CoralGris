const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Pedido = require('../models/Pedido');
const logger = require('../utils/logger');

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"]
    }
  });

  // Middleware de autenticación para Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Manejo de conexiones
  io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.userId);

    // Unir al usuario a su sala personal
    socket.join(`user_${socket.userId}`);

    // Manejar mensajes
    socket.on('send_message', async (data) => {
      // Guardar mensaje en la base de datos
      // Emitir mensaje al destinatario
      io.to(`user_${data.receptor_id}`).emit('receive_message', data);
    });

    // Si es vendedor, unirlo al room de vendedores
    if (['vendedor', 'administrador'].includes(socket.usuario.tipo_usuario)) {
      socket.join('vendedores');
    }

    // Escuchar actualizaciones de estado de pedidos
    socket.on('actualizar_estado_pedido', async (data) => {
      try {
        const { pedido_id, nuevo_estado } = data;
        const pedido = await Pedido.findByPk(pedido_id);
        
        if (pedido) {
          await pedido.update({ estado: nuevo_estado });
          
          // Notificar al cliente
          io.to(`user_${pedido.cliente_id}`).emit('pedido_actualizado', {
            pedido_id,
            estado: nuevo_estado
          });
        }
      } catch (error) {
        logger.error('Error actualizando estado de pedido:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Usuario desconectado:', socket.userId);
    });
  });

  return io;
};

module.exports = configureSocket;