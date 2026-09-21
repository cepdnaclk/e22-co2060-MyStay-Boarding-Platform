const request = require('supertest');
const { app } = require('../server');

describe('Authentication Tests', () => {

  // Invalid login
  test('Login with wrong credentials should fail', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@gmail.com',
        password: 'wrong'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Invalid email or password');
  });

  // Empty login fields
  test('Login with empty fields should fail', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: '',
        password: ''
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Invalid email or password');
  });

  // Missing password
  test('Login with missing password should fail', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@gmail.com'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Invalid email or password');
  });

  // Signup with empty required fields
  test('Signup with missing required fields should fail', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: '',
        email: '',
        password: ''
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Missing required fields');
  });

  // Signup without name
  test('Signup without name should fail', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'Test123'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Missing required fields');
  });

});