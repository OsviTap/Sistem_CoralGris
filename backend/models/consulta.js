const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Consulta extends Model {}

Consulta.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: false
  },
  asunto: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'atendida'),
    defaultValue: 'pendiente'
  }
}, {
  sequelize,
  modelName: 'Consulta',
  tableName: 'consultas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Consulta; 