const request = require('supertest');
const { app } = require('../server');

describe('Security Tests', () => {

  // SQL Injection attempt in login
  test('SQL Injection attempt should not bypass authentication', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: "' OR 1=1 --",
        password: "123"
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Invalid email or password');
    expect(res.body).not.toHaveProperty('token');
  });

  // Protected endpoint should reject unauthenticated malicious input
  test('Unauthenticated request containing script input should be rejected', async () => {
    const res = await request(app)
      .post('/api/stays')
      .send({
        title: "<script>alert('xss')</script>"
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Not authorized, no token');
  });

});