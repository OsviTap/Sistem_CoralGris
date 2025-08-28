const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Crear el cliente de Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const initializeBuckets = async () => {
  try {
    const { data, error } = await supabase
      .storage
      .createBucket('productos', {
        public: true,
        fileSizeLimit: 5242880
      });

    if (error) {
      if (error.message === 'Bucket already exists') {
        console.log('✅ Bucket "productos" ya existe');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Bucket "productos" creado exitosamente');
    }
  } catch (error) {
    console.error('❌ Error al inicializar bucket:', error.message);
  }
};

initializeBuckets();

module.exports = supabase; 