const request = require('supertest');
const mongoose = require('mongoose');
const crypto = require('crypto');
const app = require('../src/app');
const User = require('../src/models/user');

console.log('Starting User API tests');

process.env.JWT_SECRET = '6ImJuH2edC6W3CPuFZF0j6w5tw+dq45B2zNHYOlxuCU/wa/nVC3pYedO7T7ZxRrKJizz3PWwtE9edCkvH2XI2A==';

describe('User API', () => {
  beforeEach(async () => {
    console.log('Clearing User collection');
    await User.deleteMany({});
    console.log('User collection cleared');
  });
  /* beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  }); */

  describe('User Registration', () => {
    it('should register a new user', async () => {
      const user = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/users/register')
        .send(user);

      console.log('Response from register user:', res.body);

      expect(res.statusCode).toEqual(201);
      expect(res.body.user).toHaveProperty('email', user.email);
      expect(res.body.user).toHaveProperty('name', user.name);
      expect(res.body).toHaveProperty('token');
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
        expect(response.body.user).toHaveProperty('name', userData.name);
        expect(response.body.user).toHaveProperty('email', userData.email);

        const user = await User.findOne({ email: userData.email });
        expect(user).not.toBeNull();
      } catch (error) {
        console.error('Test error:', error);
        throw error;
      }
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
      const user = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: '123' // Weak password
      };

      const res = await request(app)
        .post('/api/users/register')
        .send(user);

      console.log('Response from register with weak password:', res.body);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toBeInstanceOf(Array);
    }, 90000);
  });

  describe('User Login', () => {
    it('should login a registered user', async () => {
      const user = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/users/register')
        .send(user);

      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123'
        });

      console.log('Response from login user:', res.body);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', user.email);
      expect(res.body.user).toHaveProperty('name', user.name);
    }, 90000);

    it('should not login a user with wrong password', async () => {
      const user = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
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
      expect(res.body.errors[0]).toHaveProperty('msg', 'Invalid credentials');
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
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'notregistered@example.com',
          password: 'password123'
        });

      console.log('Response from login with unregistered email:', res.body);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toHaveProperty('msg', 'Invalid credentials');
    }, 90000);
  });

  describe('User Update', () => {
    it('should update a user', async () => {
      const user = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
      };

      const resRegister = await request(app)
        .post('/api/users/register')
        .send(user);

      const userId = resRegister.body.user.id;
      const token = resRegister.body.token;

      const updatedUser = {
        name: 'Updated Test User',
        email: 'updatedtestuser@example.com'
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
        password: 'password123'
      };

      const resRegister = await request(app)
        .post('/api/users/register')
        .send(user);

      const userId = resRegister.body.user.id;
      const token = resRegister.body.token;

      const updatedUser = {
        name: '',
        email: 'invalidemail'
      };

      const resUpdate = await request(app)
        .put(`/api/users/${userId}`)
        .set('x-auth-token', token)
        .send(updatedUser);

      console.log('Response from invalid update user:', resUpdate.body);

      expect(resUpdate.statusCode).toEqual(400);
      expect(resUpdate.body).toHaveProperty('errors');
      expect(resUpdate.body.errors).toBeInstanceOf(Array);
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

        const userId = registerRes.body.user.id;
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
  });

  describe('User Information Retrieval', () => {
    it('should get a registered user info', async () => {
      const user = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
      };

      const resRegister = await request(app)
        .post('/api/users/register')
        .send(user);

      const userId = resRegister.body.user.id;
      const token = resRegister.body.token;

      const resGet = await request(app)
        .get(`/api/users/${userId}`)
        .set('x-auth-token', token);

      console.log('Response from get user info:', resGet.body);

      expect(resGet.statusCode).toEqual(200);
      expect(resGet.body).toHaveProperty('email', 'testuser@example.com');
    }, 90000);

    it('should not allow access to protected routes without a token', async () => {
      const user = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
      };

      const resRegister = await request(app)
        .post('/api/users/register')
        .send(user);

      const userId = resRegister.body.user.id;

      const resGet = await request(app)
        .get(`/api/users/${userId}`);

      console.log('Response from get user without token:', resGet.body);

      expect(resGet.statusCode).toEqual(401);
      expect(resGet.body).toHaveProperty('msg', 'No token, authorization denied');
    }, 90000);
  });

  describe('Password Management', () => {
    it('should change password successfully', async () => {
      const user = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
      };

      const resRegister = await request(app)
        .post('/api/users/register')
        .send(user);

      const token = resRegister.body.token;

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
    }, 90000);

    it('should not change password with invalid data', async () => {
      const user = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
      };

      const resRegister = await request(app)
        .post('/api/users/register')
        .send(user);

      const token = resRegister.body.token;

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
    }, 90000);

    it('should request password recovery', async () => {
      const user = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/users/register')
        .send(user);

      const res = await request(app)
        .post('/api/users/forgot-password')
        .send({ email: 'testuser@example.com' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('msg', 'Email sent');
    }, 90000);

    it('should not request password recovery for unregistered email', async () => {
      const res = await request(app)
        .post('/api/users/forgot-password')
        .send({ email: 'unregistered@example.com' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toBeInstanceOf(Array);
    }, 90000);

    it('should reset password with valid token', async () => {
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
    }, 90000);
  });

  describe('Account Deletion', () => {
    it('should delete user account successfully', async () => {
      const user = {
        name: 'Delete Test User',
        email: 'deletetest@example.com',
        password: 'password123'
      };

      const resRegister = await request(app)
        .post('/api/users/register')
        .send(user);

      const token = resRegister.body.token;
      const userId = resRegister.body.user.id;

      const resDelete = await request(app)
        .delete(`/api/users/${userId}`)
        .set('x-auth-token', token);

      expect(resDelete.statusCode).toEqual(200);
      expect(resDelete.body).toHaveProperty('msg', 'User deleted successfully');
    });

    it('should not allow access after account deletion', async () => {
      try {
        const user = {
          name: 'Access Test User',
          email: 'accesstest@example.com',
          password: 'password123'
        };
    
        console.log('Registering user for deletion test');
        const resRegister = await request(app)
          .post('/api/users/register')
          .send(user);
    
        console.log('Registration response:', resRegister.body);
    
        const token = resRegister.body.token;
        const userId = resRegister.body.user.id;
    
        console.log('Deleting user');
        const resDelete = await request(app)
          .delete(`/api/users/${userId}`)
          .set('x-auth-token', token);
    
        console.log('Delete response:', resDelete.body);
        expect(resDelete.statusCode).toEqual(200);
        expect(resDelete.body).toHaveProperty('msg', 'User deleted successfully');
    
        console.log('Attempting to login with deleted user');
        const resLogin = await request(app)
          .post('/api/users/login')
          .send({
            email: user.email,
            password: user.password
          });
    
        console.log('Login response:', resLogin.body);
        expect(resLogin.statusCode).toEqual(400);
        expect(resLogin.body).toHaveProperty('errors');
        expect(resLogin.body.errors[0]).toHaveProperty('msg', 'Invalid credentials');
    
        console.log('Attempting to get deleted user info');
        const resGet = await request(app)
          .get(`/api/users/${userId}`)
          .set('x-auth-token', token);
    
        console.log('Get user response:', resGet.body);
        expect(resGet.statusCode).toEqual(404);
        expect(resGet.body).toHaveProperty('msg', 'User not found');
    
      } catch (error) {
        console.error('Test error:', error);
        throw error;
      }
    }, 30000);
  });

  describe('Protected Routes', () => {
    it('should not allow access to protected routes without authentication', async () => {
      // Intenta obtener un usuario específico sin token
      const getUserRes = await request(app)
        .get('/api/users/someUserId');
  
      expect(getUserRes.statusCode).toEqual(401);
      expect(getUserRes.body).toHaveProperty('msg', 'No token, authorization denied');
  
      // Intenta actualizar un usuario sin token
      const updateRes = await request(app)
        .put('/api/users/someUserId')
        .send({ name: 'Updated Name' });
  
      expect(updateRes.statusCode).toEqual(401);
      expect(updateRes.body).toHaveProperty('msg', 'No token, authorization denied');
  
      // Intenta eliminar un usuario sin token
      const deleteRes = await request(app)
        .delete('/api/users/someUserId');
  
      expect(deleteRes.statusCode).toEqual(401);
      expect(deleteRes.body).toHaveProperty('msg', 'No token, authorization denied');
  
      // Intenta cambiar la contraseña sin token
      const changePasswordRes = await request(app)
        .put('/api/users/change-password')
        .send({ currentPassword: 'password123', newPassword: 'newpassword123' });
  
      expect(changePasswordRes.statusCode).toEqual(401);
      expect(changePasswordRes.body).toHaveProperty('msg', 'No token, authorization denied');
    });
  });

  describe('Protected Routes with Valid Token', () => {
    let token;
    let userId;
  
    beforeEach(async () => {
      // Registrar un nuevo usuario antes de cada prueba
      const user = {
        name: 'Test User',
        email: `testuser${Date.now()}@example.com`,
        password: 'password123'
      };
  
      const registerRes = await request(app)
        .post('/api/users/register')
        .send(user);
  
      token = registerRes.body.token;
      userId = registerRes.body.user.id;
    });
  
    afterEach(async () => {
      // Eliminar el usuario después de cada prueba
      await User.findByIdAndDelete(userId);
    });
  
    it('should allow access to protected routes with a valid token', async () => {
      // Obtener información del usuario
      const getUserRes = await request(app)
        .get(`/api/users/${userId}`)
        .set('x-auth-token', token);
  
      expect(getUserRes.statusCode).toEqual(200);
      expect(getUserRes.body).toHaveProperty('name', 'Test User');
      expect(getUserRes.body).toHaveProperty('email');
  
      // Actualizar información del usuario
      const updateRes = await request(app)
        .put(`/api/users/${userId}`)
        .set('x-auth-token', token)
        .send({ name: 'Updated Test User' });
  
      expect(updateRes.statusCode).toEqual(200);
      expect(updateRes.body).toHaveProperty('name', 'Updated Test User');
  
      // Cambiar contraseña
      const changePasswordRes = await request(app)
        .put('/api/users/change-password')
        .set('x-auth-token', token)
        .send({ currentPassword: 'password123', newPassword: 'newpassword123' });
  
      expect(changePasswordRes.statusCode).toEqual(200);
      expect(changePasswordRes.body).toHaveProperty('msg', 'Password updated successfully');
    });
  });
});