const mongoose = require('mongoose');

module.exports = async () => {
  console.log('Starting global teardown...');
  try {
    // Cerrar la conexión de Mongoose
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Mongoose connection closed successfully.');
    }

    // Detener el servidor de MongoDB en memoria
    if (global.__MONGOD__) {
      await global.__MONGOD__.stop();
      console.log('MongoDB Memory Server stopped successfully.');
    } else {
      console.warn('No MongoDB Memory Server instance found to stop.');
    }

    console.log('Global teardown completed successfully.');
  } catch (error) {
    console.error('Error in global teardown:', error);
    throw error;
  }
};