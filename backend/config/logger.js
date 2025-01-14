const winston = require('winston');
const path = require('path');

// Crear directorio de logs si no existe
const logDir = 'logs';

// Configurar formato de logs
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${message}`;
  })
);

// Crear logger
const logger = winston.createLogger({
  format: logFormat,
  transports: [
    // Logs de error en archivo
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    }),
    // Todos los logs en archivo
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log')
    })
  ]
});

// Si no estamos en producción, también log a consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
