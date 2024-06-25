const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');

describe('Users', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = process.env.MONGODB_TEST_URI || mongoServer.getUri();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }, 90000); // Incrementa el tiempo de espera a 90 segundos

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropCollection('users').catch(() => {});
  });

  it('should register a new user', async () => {
    const user = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password'
    };

    const res = await request(app)
      .post('/api/users/register')
      .send(user);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('name');
  }, 90000); // Incrementa el tiempo de espera a 90 segundos

  // Otras pruebas siguen aquí...
});
