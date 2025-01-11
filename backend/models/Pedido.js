const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pedido = sequelize.define('Pedido', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  cliente_id: {
    type: DataTypes.BIGINT,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  vendedor_id: {
    type: DataTypes.BIGINT,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  sucursal_id: {
    type: DataTypes.BIGINT,
    references: {
      model: 'sucursales',
      key: 'id'
    }
  },
  estado: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      isIn: [['pendiente', 'atendido', 'cancelado']]
    }
  },
  tipo_pago: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      isIn: [['efectivo', 'tarjeta', 'transferencia']]
    }
  },
  tipo_entrega: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      isIn: [['delivery', 'recojo']]
    }
  },
  direccion_entrega: {
    type: DataTypes.TEXT
  },
  total: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    defaultValue: 0
  },
  notas: {
    type: DataTypes.TEXT
  },
  fecha_pedido: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_entrega: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'pedidos',
  timestamps: false
});

module.exports = Pedido;