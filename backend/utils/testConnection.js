const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConnection() {
  try {
    // Probar conexión al storage
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) throw bucketsError;
    console.log('Conexión al storage exitosa:', buckets);

    // Probar permisos del bucket
    const { data: bucketPermissions, error: permissionsError } = await supabase
      .storage
      .getBucket('libreria-images');

    if (permissionsError) throw permissionsError;
    console.log('Permisos del bucket:', bucketPermissions);

  } catch (error) {
    console.error('Error en la conexión:', error);
  }
}

testConnection();