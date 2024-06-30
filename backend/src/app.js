const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

function createApp() {
  const app = express();

  // Conexión a MongoDB
  if (process.env.NODE_ENV !== 'test') {
    const mongoUri = process.env.MONGODB_URI;
    mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      driverInfo: { name: "nodejs", version: process.version }
    }).then(() => {
      console.log('Connected to MongoDB');
    }).catch((error) => {
      console.error('Error connecting to MongoDB:', error);
    });
  }

  // Middleware de seguridad
  app.use(helmet());
  app.use(cors());
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limite cada IP a 100 requests por windowMs
  }));

  // Parseo de body
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Logging
  app.use(logger);

  // Rutas
  app.use('/api/users', require('./routes/userRoutes'));
  app.use('/api/courses', require('./routes/courseRoutes'));
  app.use('/api/admin', require('./routes/adminRoutes'));

  // Manejo de rutas no encontradas
  app.use((req, res, next) => {
    const error = new Error('Route not found');
    error.status = 404;
    next(error);
  });

  // Manejo de errores
  app.use((err, req, res, next) => {
    console.error(err.stack);
    
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
      error: {
        message: message,
        status: status
      }
    });
  });

  return app;
}

module.exports = createApp;