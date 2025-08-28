const { validationResult, body } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const productValidations = [
  body('nombre').notEmpty().trim().escape(),
  body('precio_l1').isNumeric().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  validate
];

const userValidations = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('nombre').notEmpty().trim(),
  validate
];

const pedidoValidations = [
  // Datos personales
  body('nombre').notEmpty().trim()
    .withMessage('El nombre es requerido'),
  
  body('apellidos').notEmpty().trim()
    .withMessage('Los apellidos son requeridos'),
  
  body('telefono').notEmpty()
    .withMessage('El teléfono es requerido'),
  
  body('email').optional().isEmail()
    .withMessage('Email inválido'),

  // Productos
  body('productos').isArray().notEmpty()
    .withMessage('Debe incluir al menos un producto'),
  
  body('productos.*.producto_id').isInt()
    .withMessage('ID de producto inválido'),
  
  body('productos.*.cantidad').isInt({ min: 1 })
    .withMessage('Cantidad debe ser mayor a 0'),
  
  // Datos de entrega
  body('tipo_entrega').isIn(['delivery', 'recojo'])
    .withMessage('Tipo de entrega inválido'),
  
  body('direccion_entrega')
    .if(body('tipo_entrega').equals('delivery'))
    .notEmpty()
    .withMessage('Dirección de entrega es requerida para delivery'),
  
  body('referencias').optional(),
  
  body('coordenadas')
    .if(body('tipo_entrega').equals('delivery'))
    .notEmpty()
    .isObject()
    .withMessage('Las coordenadas son requeridas para delivery'),
  
  body('sucursal_id')
    .if(body('tipo_entrega').equals('recojo'))
    .isInt()
    .withMessage('Sucursal inválida'),

  // Datos de pago
  body('tipo_pago').isIn(['efectivo', 'transferencia', 'qr'])
    .withMessage('Tipo de pago inválido'),

  // Datos de facturación
  body('requiere_factura').isBoolean()
    .withMessage('Debe especificar si requiere factura'),
  
  body('razon_social')
    .if(body('requiere_factura').equals(true))
    .notEmpty()
    .withMessage('Razón social requerida para factura'),
  
  body('nit')
    .if(body('requiere_factura').equals(true))
    .notEmpty()
    .withMessage('NIT requerido para factura'),

  validate
];

module.exports = {
  productValidations,
  userValidations,
  pedidoValidations
};