const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

beforeAll(async () => {
  console.log('Setting up MongoDB Memory Server');
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log('MongoDB Memory Server URI:', uri);
  
  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    driverInfo: { name: "Mongoose", version: "6.11.2" }
  };

  console.log('Connecting to MongoDB');
  await mongoose.connect(uri, mongooseOpts);
  console.log('Connected to MongoDB');
});

afterAll(async () => {
  console.log('Closing MongoDB connection in jest.setup.js...');
  await mongoose.connection.close();
  await mongod.stop();
  console.log('MongoDB connection closed and server stopped successfully.');
});

beforeEach(async () => {
  console.log('Clearing all collections');
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
  console.log('All collections cleared');
});

console.log('Finished jest.setup.js');