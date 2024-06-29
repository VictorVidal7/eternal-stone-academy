const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

module.exports = async () => {
  console.log('Starting global setup...');
  try {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    console.log('MongoDB Memory Server started. URI:', uri);
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      driverInfo: { name: "Mongoose", version: "6.11.2" }  // Add this line
    });
    
    global.__MONGO_URI__ = uri;
    global.__MONGOD__ = mongod;
    console.log('Global setup completed successfully.');
  } catch (error) {
    console.error('Error in global setup:', error);
    throw error;
  }
};