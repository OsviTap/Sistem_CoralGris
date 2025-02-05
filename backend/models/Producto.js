const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  categoria_id: {
    type: DataTypes.BIGINT,
    references: {
      model: 'categorias',
      key: 'id'
    }
  },
  subcategoria_id: {
    type: DataTypes.BIGINT,
    references: {
      model: 'subcategorias',
      key: 'id'
    }
  },
  marca_id: {
    type: DataTypes.BIGINT,
    references: {
      model: 'marcas',
      key: 'id'
    }
  },
  precio_l1: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  precio_l2: {
    type: DataTypes.DECIMAL
  },
  precio_l3: {
    type: DataTypes.DECIMAL
  },
  precio_l4: {
    type: DataTypes.DECIMAL
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  imagen_url: {
    type: DataTypes.TEXT
  },
  codigo_sku: {
    type: DataTypes.TEXT,
    unique: true
  },
  estado: {
    type: DataTypes.TEXT,
    defaultValue: 'activo',
    validate: {
      isIn: [['activo', 'inactivo']]
    }
  },
  agotado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  cantidad_mayoreo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 12
  },
  cantidad_mayoreo_especial: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 24
  }
}, {
  tableName: 'productos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Producto;