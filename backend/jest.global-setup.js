const { MongoMemoryServer } = require('mongodb-memory-server-core');

module.exports = async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  global.__MONGOD__ = mongod;
  process.env.MONGODB_URI = uri;
};