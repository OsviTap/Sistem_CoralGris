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
    },
    allowNull: true
  },
  vendedor_id: {
    type: DataTypes.BIGINT,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellidos: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sucursal_id: {
    type: DataTypes.BIGINT,
    references: {
      model: 'sucursales',
      key: 'id'
    },
    allowNull: true
  },
  estado: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: 'pendiente',
    validate: {
      isIn: [['pendiente', 'confirmado', 'en_preparacion', 'en_camino', 'entregado', 'cancelado']]
    }
  },
  tipo_pago: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      isIn: [['efectivo', 'transferencia', 'qr']]
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
    type: DataTypes.TEXT,
    allowNull: true
  },
  referencias: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  coordenadas: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  requiere_factura: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  razon_social: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nit: {
    type: DataTypes.STRING,
    allowNull: true
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