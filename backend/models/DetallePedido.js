const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetallePedido = sequelize.define('DetallePedido', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  pedido_id: {
    type: DataTypes.BIGINT,
    references: {
      model: 'pedidos',
      key: 'id'
    },
    allowNull: false
  },
  producto_id: {
    type: DataTypes.BIGINT,
    references: {
      model: 'productos',
      key: 'id'
    },
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  precio: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL,
    allowNull: false
  }
}, {
  tableName: 'detalles_pedido',
  timestamps: false
});

module.exports = DetallePedido;