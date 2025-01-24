const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo_usuario: {
    type: DataTypes.ENUM('cliente', 'vendedor', 'administrador'),
    defaultValue: 'cliente'
  },
  empresa: {
    type: DataTypes.STRING
  },
  ruc: {
    type: DataTypes.STRING
  },
  telefono: {
    type: DataTypes.STRING
  },
  direccion: {
    type: DataTypes.TEXT
  },
  nivel_precio: {
    type: DataTypes.ENUM('L1', 'L2', 'L3', 'L4'),
    defaultValue: 'L1'
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    defaultValue: 'activo'
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Usuario;