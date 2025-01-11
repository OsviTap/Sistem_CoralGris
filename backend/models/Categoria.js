const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Categoria = sequelize.define('Categoria', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'categorias',
  timestamps: false
});

module.exports = Categoria;