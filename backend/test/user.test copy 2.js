const request = require('supertest');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/user');

// Al principio del archivo de prueba
process.env.JWT_SECRET = '6ImJuH2edC6W3CPuFZF0j6w5tw+dq45B2zNHYOlxuCU/wa/nVC3pYedO7T7ZxRrKJizz3PWwtE9edCkvH2XI2A==';

describe('Users', () => {
  let mongoServer;

  beforeAll(async () => {
    try {
      jest.setTimeout(30000);
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log('Connected to MongoDB for testing');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
  }, 30000);

  afterAll(async () => {
    try {
      await mongoose.disconnect();
      await mongoServer.stop();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
    }
  });

  beforeEach(async () => {
    try {
      await User.deleteMany({});
      console.log('Database dropped before test');
    } catch (error) {
      console.error('Error dropping database:', error);
      throw error;
    }
  });

  afterEach(async () => {
    try {
      await User.deleteMany({});
    } catch (error) {
      console.error('Error deleting users:', error);
      throw error;
    }
  });

  it('should register a new user', async () => {
    try {
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
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  it('should register a user successfully with valid data', async () => {
    try {
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
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  it('should not register a user with invalid data', async () => {
    try {
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
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  it('should not register a user with a duplicate email', async () => {
    try {
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
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  it('should login a registered user', async () => {
    try {
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
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  it('should not login a user with wrong password', async () => {
    try {
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
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  it('should update a user', async () => {
    try {
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
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  it('should not update a user with invalid data', async () => {
    try {
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
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  it('should get a registered user info', async () => {
    try {
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
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  it('should delete a user', async () => {
    try {
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
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  it('should not allow access to protected routes without a token', async () => {
    try {
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
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  it('should not register a user without a name', async () => {
    try {
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
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  it('should not register a user without an email', async () => {
    try {
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
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  it('should not register a user without a password', async () => {
    try {
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
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  it('should not register a user with a weak password', async () => {
    try {
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
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  it('should login a registered user successfully with correct credentials', async () => {
    try {
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
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  it('should not login a user with incorrect password', async () => {
    try {
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
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  it('should not login a user with an unregistered email', async () => {
    try {
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
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  it('should update a user\'s information successfully', async () => {
    try {
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
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  // Pruebas de Cambio de Contraseña
  it('should change password successfully', async () => {
    try {
      // Registrar un usuario
      const user = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
      };

      const resRegister = await request(app)
        .post('/api/users/register')
        .send(user);

      expect(resRegister.statusCode).toEqual(201);
      const token = resRegister.body.token;

      console.log('Registration response:', resRegister.body);
      console.log('Token for password change:', token);

      // Cambiar la contraseña
      const res = await request(app)
        .put('/api/users/change-password')
        .set('x-auth-token', token)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        });

      console.log('Change Password Response:', res.body);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('msg', 'Password updated successfully');
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  it('should not change password with invalid data', async () => {
    try {
      // Registrar un usuario
      const user = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
      };

      const resRegister = await request(app)
        .post('/api/users/register')
        .send(user);

      const token = resRegister.body.token;

      // Intentar cambiar la contraseña con datos inválidos
      const res = await request(app)
        .put('/api/users/change-password')
        .set('x-auth-token', token)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'short'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toBeInstanceOf(Array);
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  // Pruebas de Recuperación de Contraseña
  it('should request password recovery', async () => {
    try {
      // Registrar un usuario
      const user = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/users/register')
        .send(user);

      // Solicitar recuperación de contraseña
      const res = await request(app)
        .post('/api/users/forgot-password')
        .send({ email: 'testuser@example.com' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('msg', 'Email sent');
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  it('should not request password recovery for unregistered email', async () => {
    try {
      const res = await request(app)
        .post('/api/users/forgot-password')
        .send({ email: 'unregistered@example.com' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toBeInstanceOf(Array);
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);

  it('should reset password with valid token', async () => {
    try {
      const user = new User({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
      });

      const resetToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

      await user.save();

      const res = await request(app)
        .put(`/api/users/reset-password/${resetToken}`)
        .send({ password: 'newpassword123' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('msg', 'Password updated successfully');
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 90000);
});

describe('Account Deletion', () => {
  it('should delete user account successfully', async () => {
    try {
      // Registrar un usuario
      const user = {
        name: 'Delete Test User',
        email: 'deletetest@example.com',
        password: 'password123'
      };

      const resRegister = await request(app)
        .post('/api/users/register')
        .send(user);

      expect(resRegister.statusCode).toEqual(201);
      const token = resRegister.body.token;
      const userId = resRegister.body._id;

      // Eliminar la cuenta
      const resDelete = await request(app)
        .delete(`/api/users/${userId}`)
        .set('x-auth-token', token);

      expect(resDelete.statusCode).toEqual(200);
      expect(resDelete.body).toHaveProperty('msg', 'User deleted successfully');
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  });

  it('should not allow access after account deletion', async () => {
    try {
      // Registrar un usuario
      const user = {
        name: 'Access Test User',
        email: 'accesstest@example.com',
        password: 'password123'
      };

      const resRegister = await request(app)
        .post('/api/users/register')
        .send(user);

      expect(resRegister.statusCode).toEqual(201);
      const token = resRegister.body.token;
      const userId = resRegister.body._id;

      // Eliminar la cuenta
      const resDelete = await request(app)
        .delete(`/api/users/${userId}`)
        .set('x-auth-token', token);

      expect(resDelete.statusCode).toEqual(200);

      // Intentar iniciar sesión después de la eliminación
      const resLogin = await request(app)
        .post('/api/users/login')
        .send({
          email: user.email,
          password: user.password
        });

      expect(resLogin.statusCode).toEqual(400);
      expect(resLogin.body).toHaveProperty('errors');
      expect(resLogin.body.errors[0]).toHaveProperty('msg', 'Invalid credentials');

      // Intentar acceder a la información del usuario después de la eliminación
      const resGet = await request(app)
        .get(`/api/users/${userId}`)
        .set('x-auth-token', token);

      expect(resGet.statusCode).toEqual(404);
      expect(resGet.body).toHaveProperty('msg', 'User not found');
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  });
});