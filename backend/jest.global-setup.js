const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  const mongod = await MongoMemoryServer.create({
    binary: {
      version: '4.4.10',
    },
  });
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  global.__MONGOD__ = mongod;
};
