process.env.NODE_ENV = 'test'; // Asegúrate de que estamos en el entorno de pruebas

const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const Course = require('../src/models/course');
const User = require('../src/models/user');

beforeAll(async () => {
  console.log('Connecting to MongoDB for course tests...');
  await mongoose.connect(process.env.MONGODB_TEST_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB.');
});

afterAll(async () => {
  console.log('Closing MongoDB connection for course tests...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
});

beforeEach(async () => {
  console.log('Clearing collections for course tests...');
  await Course.deleteMany({});
  await User.deleteMany({});
  console.log('Collections cleared.');
});

describe('Courses', () => {
  describe('/POST course', () => {
    it('should create a new course', async () => {
      const instructor = new User({
        name: "Instructor",
        email: "instructor@example.com",
        password: "password",
        role: "instructor"
      });
      await instructor.save();

      const course = {
        title: "Test Course",
        description: "This is a test course",
        instructor: instructor._id,
        duration: 10
      };
      const res = await request(app)
        .post('/api/courses')
        .send(course);
      console.log('Course creation response:', res.body);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('description');
    });
  });

  describe('/GET courses', () => {
    it('should get all the courses', async () => {
      const instructor = new User({
        name: "Instructor",
        email: "instructor@example.com",
        password: "password",
        role: "instructor"
      });
      await instructor.save();

      const course = new Course({
        title: "Test Course",
        description: "This is a test course",
        instructor: instructor._id,
        duration: 10
      });
      await course.save();

      const res = await request(app).get('/api/courses');
      console.log('Get courses response:', res.body);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });
});
