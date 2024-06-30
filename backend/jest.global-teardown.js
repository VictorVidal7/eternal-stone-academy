module.exports = async () => {
  console.log('Starting global teardown...');
  try {
    await mongoose.connection.close();
    if (global.__MONGOD__) {
      await global.__MONGOD__.stop();
      console.log('MongoDB Memory Server stopped successfully.');
    }
    console.log('Global teardown completed successfully.');
  } catch (error) {
    console.error('Error in global teardown:', error);
    throw error;
  }
};