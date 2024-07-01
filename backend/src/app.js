const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();

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
  console.log('Route not found:', req.method, req.path);
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
});

// Manejo de errores
app.use(errorHandler);

module.exports = app;