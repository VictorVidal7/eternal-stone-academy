const request = require('supertest');
const mongoose = require('mongoose');
const Course = require('../src/models/course');
const app = require('../src/app');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Courses', () => {
  let mongoServer;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    }
  }, 30000); // Incrementa el tiempo de espera a 30 segundos

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await Course.deleteMany({});
  });

  test('should create a new course', async () => {
    const course = { title: 'Test Course', description: 'This is a test course', instructor: new mongoose.Types.ObjectId() };

    const res = await request(app)
      .post('/api/courses')
      .send(course);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('title', 'Test Course');
  });

  test('should get all the courses', async () => {
    const course = { title: 'Test Course', description: 'This is a test course', instructor: new mongoose.Types.ObjectId() };

    await request(app)
      .post('/api/courses')
      .send(course);

    const res = await request(app)
      .get('/api/courses');

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('title', 'Test Course');
  });
});
