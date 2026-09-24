const request = require('supertest');
const { app } = require('../server');

describe('Basic API Test', () => {

  test('GET /api/stays should respond successfully', async () => {
    const res = await request(app).get('/api/stays');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

});