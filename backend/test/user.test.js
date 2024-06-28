const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/user'); // Añadido aquí

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
    console.log('Connected to MongoDB for testing');
  }, 90000);

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log('Disconnected from MongoDB');
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropCollection('users').catch(() => {});
    console.log('Dropped users collection before test');
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

    console.log('Response from register user:', res.body);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('name');
  }, 90000);

  it('should register a user successfully with valid data', async () => {
    const userData = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'Password123',
    };

    const response = await request(app)
      .post('/api/users/register')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('name', userData.name);
    expect(response.body).toHaveProperty('email', userData.email);

    const user = await User.findOne({ email: userData.email });
    expect(user).not.toBeNull();
  }, 90000);

  it('should not register a user with invalid data', async () => {
    const user = {
      name: '',
      email: 'invalidemail',
      password: 'short'
    };
  
    const res = await request(app)
      .post('/api/users/register')
      .send(user);
  
    console.log('Response from register invalid user:', res.body);
  
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toBeInstanceOf(Array);
  }, 90000);

  it('should not register a user with a duplicate email', async () => {
    const user = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123'
    };
  
    // Register the first user
    await request(app)
      .post('/api/users/register')
      .send(user);
  
    // Try to register another user with the same email
    const res = await request(app)
      .post('/api/users/register')
      .send(user);
  
    console.log('Response from register duplicate email user:', res.body);
  
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0]).toHaveProperty('msg', 'Email already exists');
    expect(res.body.errors).toBeInstanceOf(Array);
  }, 90000);

  it('should login a registered user', async () => {
    const user = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password'
    };

    await request(app)
      .post('/api/users/register')
      .send(user);

    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'testuser@example.com',
        password: 'password'
      });

    console.log('Response from login user:', res.body);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'testuser@example.com');
  }, 90000);

  it('should not login a user with wrong password', async () => {
    const user = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password'
    };
  
    await request(app)
      .post('/api/users/register')
      .send(user);
  
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'testuser@example.com',
        password: 'wrongpassword'
      });
  
    console.log('Response from login invalid user:', res.body);
  
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors[0]).toHaveProperty('msg', 'Invalid credentials');
  }, 90000);

  it('should update a user', async () => {
    const user = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password'
    };

    const resRegister = await request(app)
      .post('/api/users/register')
      .send(user);

    const userId = resRegister.body._id;
    const token = resRegister.body.token;
    console.log('User registered for update test:', resRegister.body);

    const updatedUser = {
      name: 'Updated Test User',
      email: 'updatedtestuser@example.com',
      password: 'newpassword'
    };

    const resUpdate = await request(app)
      .put(`/api/users/${userId}`)
      .set('x-auth-token', token)
      .send(updatedUser);

    console.log('Response from update user:', resUpdate.body);

    expect(resUpdate.statusCode).toEqual(200);
    expect(resUpdate.body).toHaveProperty('name', 'Updated Test User');
    expect(resUpdate.body).toHaveProperty('email', 'updatedtestuser@example.com');
  }, 90000);

  it('should not update a user with invalid data', async () => {
    const user = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password'
    };

    const resRegister = await request(app)
      .post('/api/users/register')
      .send(user);

    const userId = resRegister.body._id;
    const token = resRegister.body.token;
    console.log('User registered for invalid update test:', resRegister.body);

    const updatedUser = {
      name: '',
      email: 'invalidemail',
      password: 'short'
    };

    const resUpdate = await request(app)
      .put(`/api/users/${userId}`)
      .set('x-auth-token', token)
      .send(updatedUser);

    console.log('Response from invalid update user:', resUpdate.body);

    expect(resUpdate.statusCode).toEqual(400);
    expect(resUpdate.body).toHaveProperty('errors');
    expect(resUpdate.body.errors).toBeInstanceOf(Array);
    expect(resUpdate.body.errors[0]).toHaveProperty('msg');
  }, 90000);

  it('should get a registered user info', async () => {
    const user = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password'
    };

    const resRegister = await request(app)
      .post('/api/users/register')
      .send(user);

    const userId = resRegister.body._id;
    const token = resRegister.body.token;
    console.log('User registered for get info test:', resRegister.body);

    const resGet = await request(app)
      .get(`/api/users/${userId}`)
      .set('x-auth-token', token);

    console.log('Response from get user info:', resGet.body);

    expect(resGet.statusCode).toEqual(200);
    expect(resGet.body).toHaveProperty('email', 'testuser@example.com');
  }, 90000);

  it('should delete a user', async () => {
    const user = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password'
    };

    const resRegister = await request(app)
      .post('/api/users/register')
      .send(user);

    const userId = resRegister.body._id;
    const token = resRegister.body.token;
    console.log('User registered for delete test:', resRegister.body);

    const resDelete = await request(app)
      .delete(`/api/users/${userId}`)
      .set('x-auth-token', token);

    console.log('Response from delete user:', resDelete.body);

    expect(resDelete.statusCode).toEqual(200);

    const resGet = await request(app)
      .get(`/api/users/${userId}`)
      .set('x-auth-token', token);

    console.log('Response from get deleted user:', resGet.body);

    expect(resGet.statusCode).toEqual(404);
  }, 90000);

  it('should not allow access to protected routes without a token', async () => {
    const user = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password'
    };

    const resRegister = await request(app)
      .post('/api/users/register')
      .send(user);

    const userId = resRegister.body._id;
    console.log('User registered for no token test:', resRegister.body);

    const resGet = await request(app)
      .get(`/api/users/${userId}`);

    console.log('Response from get user without token:', resGet.body);

    expect(resGet.statusCode).toEqual(401);
    expect(resGet.body).toHaveProperty('msg', 'No token, authorization denied');
  }, 90000);

  it('should not register a user without a name', async () => {
  const user = {
    email: 'testuser@example.com',
    password: 'password'
  };

  const res = await request(app)
    .post('/api/users/register')
    .send(user);

  console.log('Response from register without name:', res.body);

  expect(res.statusCode).toEqual(400);
  expect(res.body).toHaveProperty('errors');
  expect(res.body.errors).toBeInstanceOf(Array);
}, 90000);

it('should not register a user without an email', async () => {
  const user = {
    name: 'Test User',
    password: 'password'
  };

  const res = await request(app)
    .post('/api/users/register')
    .send(user);

  console.log('Response from register without email:', res.body);

  expect(res.statusCode).toEqual(400);
  expect(res.body).toHaveProperty('errors');
  expect(res.body.errors).toBeInstanceOf(Array);
}, 90000);

it('should not register a user without a password', async () => {
  const user = {
    name: 'Test User',
    email: 'testuser@example.com'
  };

  const res = await request(app)
    .post('/api/users/register')
    .send(user);

  console.log('Response from register without password:', res.body);

  expect(res.statusCode).toEqual(400);
  expect(res.body).toHaveProperty('errors');
  expect(res.body.errors).toBeInstanceOf(Array);
}, 90000);

it('should not register a user with a weak password', async () => {
  const user = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: '123' // Contraseña débil
  };

  const res = await request(app)
    .post('/api/users/register')
    .send(user);

  console.log('Response from register with weak password:', res.body);

  expect(res.statusCode).toEqual(400);
  expect(res.body).toHaveProperty('errors');
  expect(res.body.errors).toBeInstanceOf(Array);
}, 90000);

it('should login a registered user successfully with correct credentials', async () => {
  const user = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password'
  };

  // Register the user first
  await request(app)
    .post('/api/users/register')
    .send(user);

  // Attempt to login with correct credentials
  const res = await request(app)
    .post('/api/users/login')
    .send({
      email: user.email,
      password: user.password
    });

  console.log('Response from successful login:', res.body);

  expect(res.statusCode).toEqual(200);
  expect(res.body).toHaveProperty('token');
  expect(res.body.user).toHaveProperty('email', user.email);
  expect(res.body.user).toHaveProperty('name', user.name);
}, 90000);

it('should not login a user with incorrect password', async () => {
  const user = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password'
  };

  // Register the user first
  await request(app)
    .post('/api/users/register')
    .send(user);

  // Attempt to login with incorrect password
  const res = await request(app)
    .post('/api/users/login')
    .send({
      email: user.email,
      password: 'wrongpassword'
    });

  console.log('Response from login with incorrect password:', res.body);

  expect(res.statusCode).toEqual(400);
  expect(res.body).toHaveProperty('errors');
  expect(res.body.errors).toBeInstanceOf(Array);
  expect(res.body.errors[0]).toHaveProperty('msg', 'Invalid credentials');
}, 90000);

it('should not login a user with an unregistered email', async () => {
  const user = {
    email: 'notregistered@example.com',
    password: 'password'
  };

  // Attempt to login with unregistered email
  const res = await request(app)
    .post('/api/users/login')
    .send(user);

  console.log('Response from login with unregistered email:', res.body);

  expect(res.statusCode).toEqual(400);
  expect(res.body).toHaveProperty('errors');
  expect(res.body.errors).toBeInstanceOf(Array);
  expect(res.body.errors[0]).toHaveProperty('msg', 'Invalid credentials');
}, 90000);

it('should update a user\'s information successfully', async () => {
  const user = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password'
  };

  // Register the user first
  const registerRes = await request(app)
    .post('/api/users/register')
    .send(user);

  const userId = registerRes.body._id;
  const token = registerRes.body.token;

  const updatedData = {
    name: 'Updated User',
    email: 'updateduser@example.com'
  };

  // Attempt to update user's information
  const res = await request(app)
    .put(`/api/users/${userId}`)
    .set('x-auth-token', token)
    .send(updatedData);

  console.log('Response from update user\'s information:', res.body);

  expect(res.statusCode).toEqual(200);
  expect(res.body).toHaveProperty('name', updatedData.name);
  expect(res.body).toHaveProperty('email', updatedData.email);
}, 90000);

});
