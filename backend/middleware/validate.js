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
  body('productos').isArray().notEmpty()
    .withMessage('Debe incluir al menos un producto'),
  
  body('productos.*.producto_id').isInt()
    .withMessage('ID de producto inválido'),
  
  body('productos.*.cantidad').isInt({ min: 1 })
    .withMessage('Cantidad debe ser mayor a 0'),
  
  body('tipo_pago').isIn(['efectivo', 'tarjeta', 'transferencia'])
    .withMessage('Tipo de pago inválido'),
  
  body('tipo_entrega').isIn(['delivery', 'recojo'])
    .withMessage('Tipo de entrega inválido'),
  
  body('direccion_entrega')
    .if(body('tipo_entrega').equals('delivery'))
    .notEmpty()
    .withMessage('Dirección de entrega es requerida para delivery')
];

module.exports = {
  productValidations,
  userValidations,
  pedidoValidations
};