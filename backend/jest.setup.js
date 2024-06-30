const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

beforeAll(async () => {
  console.log('Starting MongoDB Memory Server');
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  console.log('Connecting to MongoDB in jest.setup.js');
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 20000,
    driverInfo: { name: "nodejs", version: process.version }
  });
  console.log('Connected to MongoDB');
});

afterAll(async () => {
  console.log('Closing MongoDB connection in jest.setup.js...');
  await mongoose.connection.close();
  if (mongod) {
    await mongod.stop();
  }
  console.log('MongoDB connection closed successfully.');
});

beforeEach(async () => {
  if (mongoose.connection.readyState !== 1) {
    console.log('Reconnecting to MongoDB...');
    await mongoose.connect(mongod.getUri(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 20000,
      driverInfo: { name: "nodejs", version: process.version }
    });
  }
  console.log('Clearing all collections');
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
  console.log('All collections cleared');
});