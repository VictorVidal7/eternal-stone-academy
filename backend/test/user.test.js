const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');

describe('Users', () => {
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

  beforeEach(async () => {
    await mongoose.connection.db.dropCollection('users').catch(() => {});
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

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('name');
  }, 90000); // Incrementa el tiempo de espera a 90 segundos

  it('should login a registered user', async () => {
    const user = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password'
    };

    // Primero registramos el usuario
    await request(app)
      .post('/api/users/register')
      .send(user);

    // Luego intentamos iniciar sesión
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'testuser@example.com',
        password: 'password'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', 'testuser@example.com');
  }, 90000); // Incrementa el tiempo de espera a 90 segundos

  it('should update a user', async () => {
    const user = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password'
    };

    // Primero registramos el usuario
    const resRegister = await request(app)
      .post('/api/users/register')
      .send(user);

    const userId = resRegister.body._id;
    const token = resRegister.body.token;

    // Luego actualizamos la información del usuario
    const updatedUser = {
      name: 'Updated Test User',
      email: 'updatedtestuser@example.com',
      password: 'newpassword'
    };

    const resUpdate = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedUser);

    expect(resUpdate.statusCode).toEqual(200);
    expect(resUpdate.body).toHaveProperty('name', 'Updated Test User');
    expect(resUpdate.body).toHaveProperty('email', 'updatedtestuser@example.com');
  }, 90000); // Incrementa el tiempo de espera a 90 segundos

  it('should delete a user', async () => {
    const user = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password'
    };

    // Primero registramos el usuario
    const resRegister = await request(app)
      .post('/api/users/register')
      .send(user);

    const userId = resRegister.body._id;
    const token = resRegister.body.token;

    // Luego eliminamos el usuario
    const resDelete = await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(resDelete.statusCode).toEqual(200);

    // Verificamos que el usuario ha sido eliminado
    const resGet = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(resGet.statusCode).toEqual(404);
  }, 90000); // Incrementa el tiempo de espera a 90 segundos

  // Otras pruebas siguen aquí...
});
