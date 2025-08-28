const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const InteraccionUsuario = sequelize.define('InteraccionUsuario', {
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
  productos_vistos: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: []
  },
  productos_comprados: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: []
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'interacciones_usuario',
  timestamps: false
})

module.exports = InteraccionUsuario 