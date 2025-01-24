const { Sequelize } = require('sequelize');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Crear el cliente de Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Usar la conexión directa al pooler de Supabase
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    connectTimeout: 60000
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 10000,
    evict: 1000,
    handleDisconnects: true
  },
  retry: {
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeConnectionTimedOutError/,
      /TimeoutError/
    ],
    max: 3
  },
  logging: console.log
});

const testConnection = async () => {
  try {
    // Primero probar la conexión con el cliente Supabase
    const { data: buckets, error: supabaseError } = await supabase
      .storage
      .listBuckets();

    if (supabaseError) {
      throw new Error(`Error en Supabase: ${supabaseError.message}`);
    }
    console.log('✅ Conexión a Supabase establecida correctamente');

    // Luego probar la conexión con Sequelize
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('Detalles del error:', error);
    return false;
  }
};

testConnection();

module.exports = { sequelize, supabase };

module.exports = sequelize;