const multer = require('multer');

// Configuración de almacenamiento temporal
const storage = multer.memoryStorage();

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  // Permitir solo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('El archivo debe ser una imagen'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  }
});

// Middleware de manejo de errores para multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'El archivo es demasiado grande. Máximo 5MB permitido' 
      });
    }
    return res.status(400).json({ message: error.message });
  }
  if (error.message === 'El archivo debe ser una imagen') {
    return res.status(400).json({ message: error.message });
  }
  next(error);
};

module.exports = {
  upload,
  handleMulterError
};