const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const createApp = require('./app');
const connectDB = require('./config/db');

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    const app = createApp();
    const server = http.createServer(app);

    server.listen(port, () => {
      console.log(`Server running on port ${port} in ${env} mode`);
    });

    // Manejo de cierre graceful
    const gracefulShutdown = () => {
      console.log('Shutting down gracefully');
      server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();