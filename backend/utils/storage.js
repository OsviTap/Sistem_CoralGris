const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const uploadImage = async (file, folder) => {
  try {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error al subir imagen:', error);
    throw error;
  }
};

const deleteImage = async (imageUrl) => {
  try {
    const urlParts = imageUrl.split('/');
    const filePath = urlParts[urlParts.length - 1];

    const { error } = await supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET)
      .remove([filePath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    throw error;
  }
};

module.exports = {
  uploadImage,
  deleteImage
};