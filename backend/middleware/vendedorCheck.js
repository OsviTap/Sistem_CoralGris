const vendedorMiddleware = (req, res, next) => {
    if (!['administrador', 'vendedor'].includes(req.usuario.tipo_usuario)) {
      return res.status(403).json({ 
        message: 'Acceso denegado. Se requieren permisos de vendedor o administrador' 
      });
    }
    next();
  };
  
  module.exports = vendedorMiddleware;