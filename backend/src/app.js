const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const express = require('express');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

const mongoURI = process.env.MONGODB_URI;

/* async function connectToMongo() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Could not connect to MongoDB', err);
    console.log('Attempting to reconnect...');
    setTimeout(connectToMongo, 5000);
  }
}

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
  setTimeout(connectToMongo, 5000);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  setTimeout(connectToMongo, 5000);
});

connectToMongo(); */

app.use(helmet());
app.use(cors());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));

if (process.env.NODE_ENV !== 'production') {
  const swaggerSetup = require(path.join(__dirname, '..', 'swagger'));
  swaggerSetup(app);
}

app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;