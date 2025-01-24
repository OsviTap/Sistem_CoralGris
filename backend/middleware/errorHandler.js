const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
  
    // Errores de validación de Sequelize
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Error de validación',
        errors: err.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }
  
    // Errores únicos de Sequelize (ej: email duplicado)
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'Error de datos duplicados',
        errors: err.errors.map(e => ({
          field: e.path,
          message: `El ${e.path} ya existe`
        }))
      });
    }
  
    // Error de relación en base de datos
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        message: 'Error de referencia',
        error: 'No se puede realizar la operación porque hay datos relacionados'
      });
    }
  
    // Errores personalizados
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        message: err.message
      });
    }
  
    // Error por defecto
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  };
  
  module.exports = errorHandler;