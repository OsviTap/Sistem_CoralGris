const nodemailer = require('nodemailer');
const { DetallePedido, Producto } = require('../models');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const emailService = {
  sendOrderConfirmation: async (pedido, usuario) => {
    try {
      const detalles = await DetallePedido.findAll({
        where: { pedido_id: pedido.id },
        include: [{ 
          model: Producto,
          attributes: ['nombre', 'codigo_sku']
        }]
      });

      const productosHtml = detalles.map(detalle => `
        <tr>
          <td>${detalle.Producto.nombre}</td>
          <td>${detalle.cantidad}</td>
          <td>S/. ${detalle.precio}</td>
          <td>S/. ${detalle.subtotal}</td>
        </tr>
      `).join('');

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: usuario.email,
        subject: `Confirmación de Pedido #${pedido.id}`,
        html: `
          <h1>¡Gracias por tu pedido!</h1>
          <p>Hola ${usuario.nombre},</p>
          <p>Tu pedido ha sido recibido y está siendo procesado.</p>
          
          <h2>Detalles del Pedido:</h2>
          <p><strong>Número de pedido:</strong> ${pedido.id}</p>
          <p><strong>Fecha:</strong> ${new Date(pedido.created_at).toLocaleString()}</p>
          <p><strong>Total:</strong> S/. ${pedido.total}</p>
          
          <table border="1" cellpadding="5">
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Subtotal</th>
            </tr>
            ${productosHtml}
          </table>
          
          <p><strong>Tipo de entrega:</strong> ${pedido.tipo_entrega}</p>
          ${pedido.direccion_entrega ? 
            `<p><strong>Dirección de entrega:</strong> ${pedido.direccion_entrega}</p>` 
            : ''}
          
          <p>Te notificaremos cuando tu pedido esté listo.</p>
        `
      });
    } catch (error) {
      logger.error('Error enviando email de confirmación:', error);
    }
  },

  sendPasswordReset: async (usuario, token) => {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: usuario.email,
        subject: 'Recuperación de Contraseña',
        html: `
          <h1>Recuperación de Contraseña</h1>
          <p>Click en el siguiente enlace para restablecer tu contraseña:</p>
          <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">
            Restablecer Contraseña
          </a>
        `
      });
    } catch (error) {
      console.error('Error enviando email:', error);
    }
  }
};

module.exports = emailService;