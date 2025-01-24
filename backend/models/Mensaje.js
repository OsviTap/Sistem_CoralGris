const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mensaje = sequelize.define('Mensaje', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  emisor_id: {
    type: DataTypes.BIGINT,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  receptor_id: {
    type: DataTypes.BIGINT,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  leido: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'mensajes',
  timestamps: false
});

module.exports = Mensaje;