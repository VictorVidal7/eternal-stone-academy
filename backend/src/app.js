const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const mongoURI = process.env.NODE_ENV === 'test' ? process.env.MONGODB_TEST_URI : process.env.MONGODB_URI;
const env = process.env.NODE_ENV || 'development';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(`Connected to MongoDB (${env} mode)`))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Rutas
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');  // Asegúrate de que esta línea exista

app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);  // Asegúrate de que esta línea exista

module.exports = app;
