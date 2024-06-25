const mongoose = require('mongoose');
const express = require('express');
const app = express();
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

async function connectToMongo() {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
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

module.exports = app;
