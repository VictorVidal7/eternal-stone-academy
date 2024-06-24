const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assessments', assessmentRoutes);

const dbURI = process.env.NODE_ENV === 'test' ? process.env.MONGODB_TEST_URI : process.env.MONGODB_URI;

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

module.exports = app;
