const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const CategoriaEmergente = sequelize.define('CategoriaEmergente', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false
  },
  opcion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  productos_relacionados: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: []
  },
  frecuencia: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'categorias_emergentes',
  timestamps: false
})

module.exports = CategoriaEmergente 