const mongoose = require('mongoose');
const express = require('express');
const app = express();
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

async function connectToMongo() {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(mongoURI); // Opciones obsoletas eliminadas
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('Could not connect to MongoDB', err);
    }
  }
}

connectToMongo();

// Middleware y rutas
app.use(express.json());
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));

// Integración de Swagger
require('./swagger')(app);

module.exports = app;
