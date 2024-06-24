const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');

describe('Users', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await new User({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password'
    }).save();
  });

  test('should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('name');
  });

  test('should login a user', async () => {
    const user = {
      email: 'testuser@example.com',
      password: 'password',
    };
    const res = await request(app)
      .post('/api/users/login')
      .send(user);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
  });
});
