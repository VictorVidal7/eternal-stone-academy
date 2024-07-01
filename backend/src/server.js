const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (process.env.NODE_ENV !== 'test') {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        driverInfo: { name: "nodejs", version: "6.0.12" }
      });
      console.log('Connected to MongoDB');
      
      const server = http.createServer(app);
      server.listen(PORT, () => {
        console.log(`Server running on port ${PORT} in ${env} mode`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;