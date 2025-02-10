const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductoInteres = sequelize.define('ProductoInteres', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  producto_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'productos',
      key: 'id'
    }
  },
  contador: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  ip_cliente: {
    type: DataTypes.STRING,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'producto_interes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ProductoInteres; 