const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Librería',
      version: '1.0.0',
      description: 'Documentación API Librería'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`
      }
    ]
  },
  apis: ['./routes/*.js']
};

module.exports = swaggerJsDoc(swaggerOptions);