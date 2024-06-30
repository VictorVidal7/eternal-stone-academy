const mongoose = require('mongoose');

beforeAll(async () => {
  console.log('Connecting to MongoDB in jest.setup.js');
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    driverInfo: { name: "nodejs", version: process.version }
  });
  console.log('Connected to MongoDB');
});

afterAll(async () => {
  console.log('Closing MongoDB connection in jest.setup.js...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed successfully.');
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