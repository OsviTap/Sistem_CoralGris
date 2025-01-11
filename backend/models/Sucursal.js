const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sucursal = sequelize.define('Sucursal', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  telefono: {
    type: DataTypes.TEXT
  },
  horario: {
    type: DataTypes.TEXT
  },
  estado: {
    type: DataTypes.TEXT,
    defaultValue: 'activo',
    validate: {
      isIn: [['activo', 'inactivo']]
    }
  }
}, {
  tableName: 'sucursales',
  timestamps: false
});

module.exports = Sucursal;