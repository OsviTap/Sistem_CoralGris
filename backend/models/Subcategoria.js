const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subcategoria = sequelize.define('Subcategoria', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  categoria_id: {
    type: DataTypes.BIGINT,
    references: {
      model: 'categorias',
      key: 'id'
    },
    allowNull: false
  },
  nombre: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'subcategorias',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['categoria_id', 'nombre']
    }
  ]
});

module.exports = Subcategoria;