const sequelize = require('./config/database');
const { Producto, Categoria, Marca, ColorProducto } = require('./models');

async function syncDatabase() {
  try {
    // Forzar la sincronización (esto eliminará las tablas existentes)
    await sequelize.sync({ force: true });
    console.log('Base de datos sincronizada correctamente');

    // Crear algunas categorías de ejemplo
    const categorias = await Categoria.bulkCreate([
      { nombre: 'Electrónicos' },
      { nombre: 'Ropa' },
      { nombre: 'Hogar' }
    ]);

    // Crear algunas marcas de ejemplo
    const marcas = await Marca.bulkCreate([
      { nombre: 'Samsung' },
      { nombre: 'Nike' },
      { nombre: 'IKEA' }
    ]);

    // Crear algunos productos de ejemplo
    await Producto.bulkCreate([
      {
        nombre: 'Smartphone XYZ',
        descripcion: 'Un smartphone de última generación',
        precio: 999.99,
        stock: 10,
        categoria_id: categorias[0].id,
        marca_id: marcas[0].id,
        estado: 'activo'
      },
      {
        nombre: 'Zapatillas Running',
        descripcion: 'Zapatillas deportivas para correr',
        precio: 79.99,
        stock: 15,
        categoria_id: categorias[1].id,
        marca_id: marcas[1].id,
        estado: 'activo'
      },
      {
        nombre: 'Mesa de Centro',
        descripcion: 'Mesa de centro moderna',
        precio: 149.99,
        stock: 5,
        categoria_id: categorias[2].id,
        marca_id: marcas[2].id,
        estado: 'activo'
      }
    ]);

    console.log('Datos de ejemplo creados correctamente');
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
  } finally {
    process.exit();
  }
}

syncDatabase(); 