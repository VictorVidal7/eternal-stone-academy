module.exports = async () => {
  console.log('Starting global teardown...');
  try {
    if (global.__MONGOD__) {
      await global.__MONGOD__.stop();
      console.log('MongoDB Memory Server stopped successfully.');
    } else {
      console.warn('No MongoDB instance found to stop.');
    }
    console.log('Global teardown completed successfully.');
  } catch (error) {
    console.error('Error in global teardown:', error);
    throw error;
  }
};