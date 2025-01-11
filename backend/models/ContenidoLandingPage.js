const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContenidoLandingPage = sequelize.define('ContenidoLandingPage', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  tipo_contenido: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      isIn: [['carrusel', 'oferta']]
    }
  },
  titulo: {
    type: DataTypes.TEXT
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  imagen_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  orden: {
    type: DataTypes.INTEGER
  },
  estado: {
    type: DataTypes.TEXT,
    defaultValue: 'activo',
    validate: {
      isIn: [['activo', 'inactivo']]
    }
  },
  fecha_inicio: {
    type: DataTypes.DATE
  },
  fecha_fin: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'contenido_landing_page',
  timestamps: false
});

module.exports = ContenidoLandingPage;