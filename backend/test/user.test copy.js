const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../src/models/user');
const createApp = require('../src/app');
const { setup, teardown } = require('../jest.setup');

describe('User API', () => {
  let server, app;

  beforeAll(async () => {
    await setup();
    app = createApp();
    server = app.listen(5000);
  });
  
  afterAll(async () => {
    await teardown();
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('User Registration', () => {
    it('should register a new student user', async () => {
      const user = {
        name: 'Test Student',
        email: 'teststudent@example.com',
        password: 'password123',
        role: 'student'
      };

      const res = await request(app)
        .post('/api/users/register')
        .send(user);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', 'teststudent@example.com');
      expect(res.body).toHaveProperty('token');
    });

    it('should register a new instructor user', async () => {
      const user = {
        name: 'Test Instructor',
        email: 'testinstructor@example.com',
        password: 'password123',
        role: 'instructor'
      };

      const res = await request(app)
        .post('/api/users/register')
        .send(user);

      expect(res.statusCode).toEqual(201);
      expect(res.body.user).toHaveProperty('email', user.email);
      expect(res.body.user).toHaveProperty('name', user.name);
      expect(res.body.user).toHaveProperty('role', 'instructor');
      expect(res.body).toHaveProperty('token');
    });

    it('should not register a user with invalid data', async () => {
      const user = {
        name: '',
        email: 'invalidemail',
        password: 'short'
      };

      const res = await request(app)
        .post('/api/users/register')
        .send(user);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toBeInstanceOf(Array);
    });

    it('should not register a user with a duplicate email', async () => {
      const user = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/users/register')
        .send(user);

      const res = await request(app)
        .post('/api/users/register')
        .send(user);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toHaveProperty('msg', 'Email already exists');
    });

    it('should not register a user without a name', async () => {
      const user = {
        email: 'testuser@example.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/users/register')
        .send(user);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toBeInstanceOf(Array);
    });

    it('should not register a user without an email', async () => {
      const user = {
        name: 'Test User',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/users/register')
        .send(user);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toBeInstanceOf(Array);
    });

    it('should not register a user without a password', async () => {
      const user = {
        name: 'Test User',
        email: 'testuser@example.com'
      };

      const res = await request(app)
        .post('/api/users/register')
        .send(user);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toBeInstanceOf(Array);
    });

    it('should not register a user with a weak password', async () => {
      const user = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: '123'
      };

      const res = await request(app)
        .post('/api/users/register')
        .send(user);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toBeInstanceOf(Array);
    });
  });

  describe('User Login', () => {
    it('should login a registered student user', async () => {
      const user = {
        name: 'Test Student',
        email: 'teststudent@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/users/register')
        .send(user);

      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'teststudent@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', user.email);
      expect(res.body.user).toHaveProperty('name', user.name);
      expect(res.body.user).toHaveProperty('role', 'student');
    });

    it('should login a registered instructor user', async () => {
      const user = {
        name: 'Test Instructor',
        email: 'testinstructor@example.com',
        password: 'password123',
        role: 'instructor'
      };

      await request(app)
        .post('/api/users/register')
        .send(user);

      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'testinstructor@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', user.email);
      expect(res.body.user).toHaveProperty('name', user.name);
      expect(res.body.user).toHaveProperty('role', 'instructor');
    });

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

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toHaveProperty('msg', 'Invalid credentials');
    });

    it('should not login a user with an unregistered email', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'notregistered@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toHaveProperty('msg', 'Invalid credentials');
    });
  });

  describe('User Update', () => {
    it('should update a user\'s information successfully', async () => {
      const user = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
      };

      const registerRes = await request(app)
        .post('/api/users/register')
        .send(user);

      const userId = registerRes.body.user.id;
      const token = registerRes.body.token;

      const updatedData = {
        name: 'Updated User',
        email: 'updateduser@example.com'
      };

      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('x-auth-token', token)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.user).toHaveProperty('name', updatedData.name);
      expect(res.body.user).toHaveProperty('email', updatedData.email);
    });

    it('should not update a user with invalid data', async () => {
      const user = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
      };

      const registerRes = await request(app)
        .post('/api/users/register')
        .send(user);

      const userId = registerRes.body.user.id;
      const token = registerRes.body.token;

      const updatedUser = {
        name: '',
        email: 'invalidemail'
      };

      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('x-auth-token', token)
        .send(updatedUser);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toBeInstanceOf(Array);
    });
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

      expect(resGet.statusCode).toEqual(200);
      expect(resGet.body.user).toHaveProperty('email', 'testuser@example.com');
      expect(resGet.body.user).toHaveProperty('role', 'student');
    });

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

      expect(resGet.statusCode).toEqual(401);
      expect(resGet.body).toHaveProperty('errors');
      expect(resGet.body.errors[0]).toHaveProperty('msg', 'No token, authorization denied');
    });
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

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('msg', 'Password updated successfully');
    });

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
    });

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
    });

    it('should not request password recovery for unregistered email', async () => {
      const res = await request(app)
        .post('/api/users/forgot-password')
        .send({ email: 'unregistered@example.com' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toBeInstanceOf(Array);
    });

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
    });
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
      const user = {
        name: 'Access Test User',
        email: 'accesstest@example.com',
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

      const resLogin = await request(app)
        .post('/api/users/login')
        .send({
          email: user.email,
          password: user.password
        });

      expect(resLogin.statusCode).toEqual(400);
      expect(resLogin.body).toHaveProperty('errors');
      expect(resLogin.body.errors[0]).toHaveProperty('msg', 'Invalid credentials');

      const resGet = await request(app)
        .get(`/api/users/${userId}`)
        .set('x-auth-token', token);

      expect(resGet.statusCode).toEqual(404);
      expect(resGet.body).toHaveProperty('errors');
      expect(resGet.body.errors[0]).toHaveProperty('msg', 'User not found');
    });
  });

  describe('Role-based Access Control', () => {
    let adminToken, instructorToken, studentToken;
    let adminId, instructorId, studentId;

    beforeEach(async () => {
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminpassword',
        role: 'admin'
      });
      const instructorUser = await User.create({
        name: 'Instructor User',
        email: 'instructor@example.com',
        password: 'instructorpassword',
        role: 'instructor'
      });
      const studentUser = await User.create({
        name: 'Student User',
        email: 'student@example.com',
        password: 'studentpassword'
      });

      adminId = adminUser._id;
      instructorId = instructorUser._id;
      studentId = studentUser._id;

      adminToken = jwt.sign({ id: adminId }, process.env.JWT_SECRET, { expiresIn: '1h' });
      instructorToken = jwt.sign({ id: instructorId }, process.env.JWT_SECRET, { expiresIn: '1h' });
      studentToken = jwt.sign({ id: studentId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    it('should allow admin to access admin routes', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('x-auth-token', adminToken);

      expect(res.statusCode).toEqual(200);
    });

    it('should not allow instructor to access admin routes', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('x-auth-token', instructorToken);

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toHaveProperty('msg', 'Access denied. Required role not found.');
    });

    it('should not allow student to access admin routes', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('x-auth-token', studentToken);

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toHaveProperty('msg', 'Access denied. Required role not found.');
    });

    it('should not allow instructor to change user roles', async () => {
      const res = await request(app)
        .put('/api/users/change-role')
        .set('x-auth-token', instructorToken)
        .send({ userId: studentId, newRole: 'instructor' });

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toHaveProperty('msg', 'Access denied. Required role not found.');
    });

    it('should not allow instructor to access role change endpoint', async () => {
      const res = await request(app)
        .put('/api/users/change-role')
        .set('x-auth-token', instructorToken)
        .send({ userId: studentId, newRole: 'instructor' });

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toHaveProperty('msg', 'Access denied. Required role not found.');
    });

    it('should not allow student to change user roles', async () => {
      const res = await request(app)
        .put('/api/users/change-role')
        .set('x-auth-token', studentToken)
        .send({ userId: instructorId, newRole: 'student' });

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toHaveProperty('msg', 'Access denied. Required role not found.');
    });
  });

  describe('Protected Routes', () => {
    it('should not allow access to protected routes without authentication', async () => {
      const getUserRes = await request(app).get('/api/users/someUserId');
      expect(getUserRes.statusCode).toEqual(401);
      expect(getUserRes.body).toHaveProperty('errors');
      expect(getUserRes.body.errors[0]).toHaveProperty('msg', 'No token, authorization denied');

      const updateRes = await request(app)
        .put('/api/users/someUserId')
        .send({ name: 'Updated Name' });
      expect(updateRes.statusCode).toEqual(401);
      expect(updateRes.body).toHaveProperty('errors');
      expect(updateRes.body.errors[0]).toHaveProperty('msg', 'No token, authorization denied');

      const deleteRes = await request(app).delete('/api/users/someUserId');
      expect(deleteRes.statusCode).toEqual(401);
      expect(deleteRes.body).toHaveProperty('errors');
      expect(deleteRes.body.errors[0]).toHaveProperty('msg', 'No token, authorization denied');

      const changePasswordRes = await request(app)
        .put('/api/users/change-password')
        .send({ currentPassword: 'password123', newPassword: 'newpassword123' });
      expect(changePasswordRes.statusCode).toEqual(401);
      expect(changePasswordRes.body).toHaveProperty('errors');
      expect(changePasswordRes.body.errors[0]).toHaveProperty('msg', 'No token, authorization denied');
    });
  });

  describe('Protected Routes with Valid Token', () => {
    let token;
    let userId;

    beforeEach(async () => {
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
      await User.findByIdAndDelete(userId);
    });

    it('should allow access to protected routes with a valid token', async () => {
      const getUserRes = await request(app)
        .get(`/api/users/${userId}`)
        .set('x-auth-token', token);

      expect(getUserRes.statusCode).toEqual(200);
      expect(getUserRes.body.user).toHaveProperty('name', 'Test User');
      expect(getUserRes.body.user).toHaveProperty('email');

      const updateRes = await request(app)
        .put(`/api/users/${userId}`)
        .set('x-auth-token', token)
        .send({ name: 'Updated Test User' });

      expect(updateRes.statusCode).toEqual(200);
      expect(updateRes.body.user).toHaveProperty('name', 'Updated Test User');

      const changePasswordRes = await request(app)
        .put('/api/users/change-password')
        .set('x-auth-token', token)
        .send({ currentPassword: 'password123', newPassword: 'newpassword123' });

      expect(changePasswordRes.statusCode).toEqual(200);
      expect(changePasswordRes.body).toHaveProperty('msg', 'Password updated successfully');
    });
  });

  describe('Student-specific Access', () => {
    let studentToken;
    let studentId;

    beforeEach(async () => {
      const studentUser = {
        name: 'Student User',
        email: 'student@example.com',
        password: 'studentpassword'
      };

      const studentRes = await request(app)
        .post('/api/users/register')
        .send(studentUser);

      studentToken = studentRes.body.token;
      studentId = studentRes.body.user.id;
    });

    it('should allow student to access their own profile', async () => {
      const res = await request(app)
        .get(`/api/users/${studentId}`)
        .set('x-auth-token', studentToken);

      expect(res.statusCode).toEqual(200);
      expect(res.body.user).toHaveProperty('name', 'Student User');
      expect(res.body.user).toHaveProperty('email', 'student@example.com');
      expect(res.body.user).toHaveProperty('role', 'student');
    });

    it('should allow student to update their own profile', async () => {
      const res = await request(app)
        .put(`/api/users/${studentId}`)
        .set('x-auth-token', studentToken)
        .send({ name: 'Updated Student Name' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.user).toHaveProperty('name', 'Updated Student Name');
    });

    it('should allow student to change their password', async () => {
      const res = await request(app)
        .put('/api/users/change-password')
        .set('x-auth-token', studentToken)
        .send({ currentPassword: 'studentpassword', newPassword: 'newstudentpassword' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('msg', 'Password updated successfully');
    });

    it('should allow student to view available courses', async () => {
      const res = await request(app)
        .get('/api/courses')
        .set('x-auth-token', studentToken);

      expect(res.statusCode).toEqual(200);
    });

    it('should not allow student to create a course', async () => {
      const courseData = {
        title: 'New Course',
        description: 'This is a new course'
      };

      const res = await request(app)
        .post('/api/courses')
        .set('x-auth-token', studentToken)
        .send(courseData);

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toHaveProperty('msg', 'Access denied. Required role not found.');
    });

    it('should not allow student to access admin dashboard', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('x-auth-token', studentToken);

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toHaveProperty('msg', 'Access denied. Required role not found.');
    });

    it('should not allow student to change user roles', async () => {
      const res = await request(app)
        .put('/api/users/change-role')
        .set('x-auth-token', studentToken)
        .send({ userId: studentId, newRole: 'instructor' });

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toHaveProperty('msg', 'Access denied. Required role not found.');
    });
  });

  describe('Student Role Change Restrictions', () => {
    let studentToken, studentId, anotherStudentId, instructorId, adminId;

    beforeEach(async () => {
      await User.deleteMany({});

      const studentUser = await User.create({
        name: 'Test Student',
        email: 'student@test.com',
        password: 'password123',
        role: 'student'
      });
      studentId = studentUser._id;

      const anotherStudentUser = await User.create({
        name: 'Another Student',
        email: 'anotherstudent@test.com',
        password: 'password123',
        role: 'student'
      });
      anotherStudentId = anotherStudentUser._id;

      const instructorUser = await User.create({
        name: 'Test Instructor',
        email: 'instructor@test.com',
        password: 'password123',
        role: 'instructor'
      });
      instructorId = instructorUser._id;

      const adminUser = await User.create({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      });
      adminId = adminUser._id;

      studentToken = jwt.sign({ id: studentId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    it('should not allow student to change their own role', async () => {
      const res = await request(app)
        .put('/api/users/change-role')
        .set('x-auth-token', studentToken)
        .send({ userId: studentId, newRole: 'instructor' });

      expect(res.statusCode).toEqual(403);
      expect(res.body.errors[0]).toHaveProperty('msg', 'Access denied. Required role not found.');
    });

    it('should not allow student to change another student\'s role', async () => {
      const res = await request(app)
        .put('/api/users/change-role')
        .set('x-auth-token', studentToken)
        .send({ userId: anotherStudentId, newRole: 'instructor' });

      expect(res.statusCode).toEqual(403);
      expect(res.body.errors[0]).toHaveProperty('msg', 'Access denied. Required role not found.');
    });

    it('should not allow student to change an instructor\'s role', async () => {
      const res = await request(app)
        .put('/api/users/change-role')
        .set('x-auth-token', studentToken)
        .send({ userId: instructorId, newRole: 'student' });

      expect(res.statusCode).toEqual(403);
      expect(res.body.errors[0]).toHaveProperty('msg', 'Access denied. Required role not found.');
    });

    it('should not allow student to change an admin\'s role', async () => {
      const res = await request(app)
        .put('/api/users/change-role')
        .set('x-auth-token', studentToken)
        .send({ userId: adminId, newRole: 'student' });

      expect(res.statusCode).toEqual(403);
      expect(res.body.errors[0]).toHaveProperty('msg', 'Access denied. Required role not found.');
    });
  });

  describe('Extended Role-based Access Control', () => {
    let adminToken, instructorToken, studentToken;
    let adminId, instructorId, studentId;

    beforeEach(async () => {
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminpassword',
        role: 'admin'
      });
      const instructorUser = await User.create({
        name: 'Instructor User',
        email: 'instructor@example.com',
        password: 'instructorpassword',
        role: 'instructor'
      });
      const studentUser = await User.create({
        name: 'Student User',
        email: 'student@example.com',
        password: 'studentpassword'
      });

      adminId = adminUser._id;
      instructorId = instructorUser._id;
      studentId = studentUser._id;

      adminToken = jwt.sign({ id: adminId }, process.env.JWT_SECRET, { expiresIn: '1h' });
      instructorToken = jwt.sign({ id: instructorId }, process.env.JWT_SECRET, { expiresIn: '1h' });
      studentToken = jwt.sign({ id: studentId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    it('should allow admin to access all admin routes', async () => {
      const routes = [
        '/api/admin/dashboard',
        '/api/admin/users',
        '/api/admin/courses',
        '/api/admin/reports'
      ];

      for (const route of routes) {
        const res = await request(app)
          .get(route)
          .set('x-auth-token', adminToken);

        expect(res.statusCode).toEqual(200);
      }
    });

    it('should not allow instructor to access any admin routes', async () => {
      const routes = [
        '/api/admin/dashboard',
        '/api/admin/users',
        '/api/admin/courses',
        '/api/admin/reports'
      ];

      for (const route of routes) {
        const res = await request(app)
          .get(route)
          .set('x-auth-token', instructorToken);

        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors[0]).toHaveProperty('msg', 'Access denied. Required role not found.');
      }
    });

    it('should not allow student to access any admin routes', async () => {
      const routes = [
        '/api/admin/dashboard',
        '/api/admin/users',
        '/api/admin/courses',
        '/api/admin/reports'
      ];

      for (const route of routes) {
        const res = await request(app)
          .get(route)
          .set('x-auth-token', studentToken);

        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors[0]).toHaveProperty('msg', 'Access denied. Required role not found.');
      }
    });

    it('should allow admin to perform all CRUD operations on users', async () => {
      const createRes = await request(app)
        .post('/api/users')
        .set('x-auth-token', adminToken)
        .send({ name: 'New User', email: 'newuser@test.com', password: 'password123' });
      expect(createRes.statusCode).toEqual(201);

      const newUserId = createRes.body.user.id;

      const readRes = await request(app)
        .get(`/api/users/${newUserId}`)
        .set('x-auth-token', adminToken);
      expect(readRes.statusCode).toEqual(200);

      const updateRes = await request(app)
        .put(`/api/users/${newUserId}`)
        .set('x-auth-token', adminToken)
        .send({ name: 'Updated User' });
      expect(updateRes.statusCode).toEqual(200);

      const deleteRes = await request(app)
        .delete(`/api/users/${newUserId}`)
        .set('x-auth-token', adminToken);
      expect(deleteRes.statusCode).toEqual(200);
    });

    it('should allow instructor to access instructor-specific routes', async () => {
      const routes = [
        '/api/courses/create',
        '/api/courses/my-courses',
        '/api/assessments/create'
      ];

      for (const route of routes) {
        const res = await request(app)
          .get(route)
          .set('x-auth-token', instructorToken);

        expect(res.statusCode).toEqual(200);
      }
    });

    it('should not allow student to access instructor-specific routes', async () => {
      const routes = [
        '/api/courses/create',
        '/api/courses/my-courses',
        '/api/assessments/create'
      ];

      for (const route of routes) {
        const res = await request(app)
          .get(route)
          .set('x-auth-token', studentToken);

        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors[0]).toHaveProperty('msg', 'Access denied. Required role not found.');
      }
    });
  });
});