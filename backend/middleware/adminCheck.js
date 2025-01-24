const adminMiddleware = (req, res, next) => {
    if (req.usuario.tipo_usuario !== 'administrador') {
      return res.status(403).json({ 
        message: 'Acceso denegado. Se requieren permisos de administrador' 
      });
    }
    next();
  };
  
  module.exports = adminMiddleware;