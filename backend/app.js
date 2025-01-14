const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a la API de Librería',
    status: 'online',
    version: '1.0.0'
  });
});

// Rutas API
app.use('/api', routes);

// Manejo de errores
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;