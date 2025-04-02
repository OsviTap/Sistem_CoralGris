const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const PatronInteraccion = sequelize.define('PatronInteraccion', {
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
  }
}, {
  tableName: 'patrones_interaccion',
  timestamps: false
})

module.exports = PatronInteraccion 