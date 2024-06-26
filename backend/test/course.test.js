const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');

describe('Courses', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = process.env.MONGODB_TEST_URI || mongoServer.getUri();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri); // Opciones obsoletas eliminadas
  }, 90000); // Incrementa el tiempo de espera a 90 segundos

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should create a new course', async () => {
    const course = { title: 'Test Course', description: 'This is a test course', instructor: new mongoose.Types.ObjectId() };

    const res = await request(app)
      .post('/api/courses')
      .send(course);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('title', 'Test Course');
  }, 90000); // Incrementa el tiempo de espera a 90 segundos

  // Otras pruebas siguen aquí...
});
