const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app } = require('../server');

describe('Authentication Middleware Tests', () => {

  test('Protected route without token should return 401', async () => {
    const res = await request(app)
      .get('/api/stays/landlord/my-listings');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Not authorized, no token');
  });

  test('Protected route with invalid token should return 401', async () => {
    const res = await request(app)
      .get('/api/stays/landlord/my-listings')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Not authorized, token failed');
  });

  test('Protected route with valid token should allow access', async () => {
    const token = jwt.sign(
      {
        id: 999999999,
        role: 'landlord'
      },
      process.env.JWT_SECRET || 'mystay_temporary_secret'
    );

    const res = await request(app)
      .get('/api/stays/landlord/my-listings')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

});