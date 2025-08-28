const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de Sequelize para Supabase

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
    // Verificar que DATABASE_URL esté configurado
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL no está configurado en el archivo .env');
    }

    console.log('🔍 Intentando conectar a la base de datos...');
    console.log('📡 URL:', process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@')); // Ocultar password
    
    // Probar la conexión con Sequelize
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    
    // Sincronizar modelos (solo verificar conexión, no modificar estructura)
    console.log('🔄 Verificando estructura de la base de datos...');
    await sequelize.sync({ force: false });
    console.log('✅ Conexión a la base de datos verificada correctamente');
    
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('Detalles del error:', error);
    
    if (error.message.includes('DATABASE_URL')) {
      console.error('💡 Solución: Crea un archivo .env en la carpeta backend/ con DATABASE_URL');
    } else if (error.message.includes('connection')) {
      console.error('💡 Solución: Verifica que la URL de la base de datos sea correcta');
    }
    
    return false;
  }
};

// Ejecutar test de conexión y manejar el resultado
testConnection().then(success => {
  if (!success) {
    console.error('🚨 No se pudo conectar a la base de datos. El servidor puede fallar.');
  }
});

module.exports = sequelize;