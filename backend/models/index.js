const Producto = require('./Producto');
const ColorProducto = require('./ColorProducto');
const Usuario = require('./Usuario');
const Pedido = require('./Pedido');
const Mensaje = require('./Mensaje');
const ContenidoLandingPage = require('./ContenidoLandingPage');
const Categoria = require('./Categoria');
const Subcategoria = require('./Subcategoria');
const Marca = require('./Marca.js');
const Sucursal = require('./Sucursal');
const DetallePedido = require('./DetallePedido');
const Consulta = require('./consulta');

// Asociaciones de Producto
Producto.belongsTo(Categoria, { 
  foreignKey: 'categoria_id',
  as: 'categoria'
});
Producto.belongsTo(Subcategoria, { 
  foreignKey: 'subcategoria_id',
  as: 'subcategoria'
});
Producto.belongsTo(Marca, { 
  foreignKey: 'marca_id',
  as: 'marca'
});
Producto.hasMany(ColorProducto, { 
  foreignKey: 'producto_id',
  as: 'colores'
});

// Asociaciones de Usuario
Usuario.belongsTo(Sucursal, { foreignKey: 'sucursal_id' });
Usuario.hasMany(Pedido, { foreignKey: 'cliente_id', as: 'PedidosCliente' });
Usuario.hasMany(Pedido, { foreignKey: 'vendedor_id', as: 'PedidosVendedor' });

// Asociaciones de Pedido
Pedido.belongsTo(Usuario, { foreignKey: 'cliente_id', as: 'Cliente' });
Pedido.belongsTo(Usuario, { foreignKey: 'vendedor_id', as: 'Vendedor' });
Pedido.belongsTo(Sucursal, { foreignKey: 'sucursal_id' });

// Asociaciones de Mensaje
Mensaje.belongsTo(Usuario, { foreignKey: 'emisor_id', as: 'Emisor' });
Mensaje.belongsTo(Usuario, { foreignKey: 'receptor_id', as: 'Receptor' });

// Asociaciones de Categoria y Subcategoria
Categoria.hasMany(Subcategoria, { foreignKey: 'categoria_id', as: 'subcategorias' });
Subcategoria.belongsTo(Categoria, { foreignKey: 'categoria_id' });

// Asociaciones de DetallePedido
DetallePedido.belongsTo(Pedido, { foreignKey: 'pedido_id' });
DetallePedido.belongsTo(Producto, { foreignKey: 'producto_id' });
Pedido.hasMany(DetallePedido, { foreignKey: 'pedido_id' });
Producto.hasMany(DetallePedido, { foreignKey: 'producto_id' });

module.exports = {
  Producto,
  ColorProducto,
  Consulta,
  Usuario,
  Pedido,
  Mensaje,
  ContenidoLandingPage,
  Categoria,
  Subcategoria,
  Marca,
  Sucursal,
  DetallePedido
};