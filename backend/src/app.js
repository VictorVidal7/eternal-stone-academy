const express = require('express');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const logger = require('./middleware/logger');
require('dotenv').config();

function createApp() {
  const app = express();

  // Middleware de seguridad
  app.use(helmet());
  app.use(cors());
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
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

  // Swagger setup
  if (process.env.NODE_ENV !== 'production') {
    const swaggerSetup = require(path.join(__dirname, '..', 'swagger'));
    swaggerSetup(app);
  }

  // Manejo de rutas no encontradas
  app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
  });

  // Manejo de errores
  app.use(errorHandler);

  return app;
}

module.exports = createApp;