// test/user.test.js

import request from 'supertest';
import app from '../src/app';
import User from '../src/models/user';

describe('Users', () => {
  let user;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await User.deleteMany({});
    user = new User({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password',
    });
    await user.save();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ name: 'New User', email: 'newuser@example.com', password: 'password' });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('name');
  });

  it('should login a user', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: user.email, password: 'password' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
  });

  it('should update user info', async () => {
    const res = await request(app)
      .put(`/api/users/${user._id}`)
      .send({ name: 'Updated User', email: 'updateduser@example.com' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Updated User');
    expect(res.body).toHaveProperty('email', 'updateduser@example.com');
  });

  it('should handle user not found for update', async () => {
    const res = await request(app)
      .put('/api/users/60d9f9f9f9f9f9f9f9f9f9f9') // Invalid user ID
      .send({ name: 'Nonexistent User', email: 'nonexistent@example.com' });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('error', 'User not found');
  });

  it('should delete a user', async () => {
    const res = await request(app).delete(`/api/users/${user._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'User deleted successfully');
  });
  
  it('should handle user not found for deletion', async () => {
    const res = await request(app).delete('/api/users/60d9f9f9f9f9f9f9f9f9f9f9'); // Invalid user ID
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('error', 'User not found');
  });

  it('should handle validation errors during registration', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ name: '', email: 'invalidemail', password: '' });
  
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
  });
});
