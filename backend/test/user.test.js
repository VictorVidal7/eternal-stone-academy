process.env.NODE_ENV = 'test'; // Asegúrate de que estamos en el entorno de pruebas

const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/user');

beforeAll(async () => {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_TEST_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB.');
});

afterAll(async () => {
  console.log('Closing MongoDB connection...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
});

beforeEach(async () => {
  console.log('Clearing users collection...');
  await User.deleteMany({});
  console.log('Users collection cleared.');
});

describe('Users', () => {
  describe('/POST register', () => {
    it('should register a new user', async () => {
      const user = {
        name: "Test User",
        email: "testuser@example.com",
        password: "password"
      };
      const res = await request(app)
        .post('/api/users/register')
        .send(user);
      console.log('Register response:', res.body);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('email');
      expect(res.body).toHaveProperty('name');

      // Verificar que el usuario está en la base de datos
      const registeredUser = await User.findOne({ email: user.email });
      console.log('Registered user found:', registeredUser);
      expect(registeredUser).not.toBeNull();
    });
  });

  describe('/POST login', () => {
    it('should login a user', async () => {
      const user = {
        name: "Test User",
        email: "testuser@example.com",
        password: "password"
      };
      await request(app)
        .post('/api/users/register')
        .send(user);

      // Verificar que el usuario está en la base de datos
      const registeredUser = await User.findOne({ email: user.email });
      console.log('Registered user for login found:', registeredUser);
      if (!registeredUser) {
        throw new Error('User not found in database after registration');
      }

      const res = await request(app)
        .post('/api/users/login')
        .send({ email: user.email, password: user.password });
      console.log('Login response:', res.body);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Login successful');
    });
  });
});
