const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tipo_usuario: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      isIn: [['cliente', 'vendedor', 'administrador']]
    }
  },
  telefono: {
    type: DataTypes.TEXT
  },
  empresa: {
    type: DataTypes.TEXT
  },
  ruc: {
    type: DataTypes.TEXT
  },
  direccion: {
    type: DataTypes.TEXT
  },
  nivel_precio: {
    type: DataTypes.TEXT,
    validate: {
      isIn: [['L1', 'L2', 'L3', 'L4']]
    }
  },
  estado: {
    type: DataTypes.TEXT,
    defaultValue: 'activo',
    validate: {
      isIn: [['activo', 'inactivo']]
    }
  },
  sucursal_id: {
    type: DataTypes.BIGINT,
    references: {
      model: 'sucursales',
      key: 'id'
    }
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Usuario;