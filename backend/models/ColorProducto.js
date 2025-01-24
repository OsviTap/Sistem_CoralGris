const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ColorProducto = sequelize.define('ColorProducto', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  producto_id: {
    type: DataTypes.BIGINT,
    references: {
      model: 'productos',
      key: 'id'
    }
  },
  color: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'colores_producto',
  timestamps: false
});

module.exports = ColorProducto;