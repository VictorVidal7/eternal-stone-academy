const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

async function connectToMongo() {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(mongoURI);
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('Could not connect to MongoDB', err);
      process.exit(1);
    }
  }
}

connectToMongo();

// Configuración de seguridad
app.use(helmet());

// Configuración de CORS
app.use(cors());

// Límite de tasa para todas las solicitudes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 solicitudes por ventana por IP
});
app.use(limiter);

// Middleware
app.use(express.json({ limit: '10kb' })); // Limita el tamaño del body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rutas
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));

// Integración de Swagger
if (process.env.NODE_ENV !== 'production') {
  const swaggerSetup = require(path.join(__dirname, '..', 'swagger'));
  swaggerSetup(app);
}

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Middleware de manejo de errores
app.use(errorHandler);

module.exports = app;