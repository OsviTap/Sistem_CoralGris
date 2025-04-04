const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ProductoInteres = require('./ProductoInteres');

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
    type: DataTypes.TEXT,
    allowNull: false
  },
  categoria_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'categorias',
      key: 'id'
    }
  },
  marca_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'marcas',
      key: 'id'
    }
  },
  precio_l1: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  precio_l2: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  precio_l3: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  precio_l4: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  agotado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  imagen_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imagenes_adicionales: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true,
    defaultValue: []
  },
  codigo_sku: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estado: {
    type: DataTypes.TEXT,
    defaultValue: 'activo'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  subcategoria_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'subcategorias',
      key: 'id'
    }
  },
  cantidad_mayoreo: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  cantidad_mayoreo_especial: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'productos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeSave: async (producto) => {
      // Actualizar estado agotado basado en stock
      producto.agotado = producto.stock <= 0
    }
  }
});

Producto.hasOne(ProductoInteres, {
  foreignKey: 'producto_id',
  as: 'interes'
});

module.exports = Producto;