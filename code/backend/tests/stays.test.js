const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app } = require('../server');

describe('Stay API Tests', () => {

  // 1. Get all stays
  test('GET /api/stays should return all stays', async () => {
    const res = await request(app)
      .get('/api/stays');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });


  // 2. Empty request without authentication
  test('POST /api/stays with empty body and no authentication should return 401', async () => {
    const res = await request(app)
      .post('/api/stays')
      .send({});

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Not authorized, no token');
  });


  // 3. Create stay without authentication
  test('POST /api/stays without authentication should return 401', async () => {
    const res = await request(app)
      .post('/api/stays')
      .send({
        title: 'Test Boarding',
        price: 10000,
        latitude: 7.2906,
        longitude: 80.6337
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Not authorized, no token');
  });


  // 4. Access landlord listings without authentication
  test('GET landlord listings without authentication should return 401', async () => {
    const res = await request(app)
      .get('/api/stays/landlord/my-listings');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Not authorized, no token');
  });


  // 5. Get an existing stay
  test('GET /api/stays/:id should return an existing stay', async () => {
    // First get all stays
    const allStays = await request(app)
      .get('/api/stays');

    expect(allStays.statusCode).toBe(200);
    expect(Array.isArray(allStays.body)).toBe(true);

    // Only continue if at least one stay exists
    if (allStays.body.length > 0) {
      const stayId = allStays.body[0].stay_id;

      const res = await request(app)
        .get(`/api/stays/${stayId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.stay_id).toBe(stayId);
    }
  });


  // 6. Get a stay that does not exist
  test('GET /api/stays/:id with nonexistent ID should return 404', async () => {
    const res = await request(app)
      .get('/api/stays/999999999');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Stay not found');
  });


  // 7. Authenticated request with missing required fields
  test('POST /api/stays with valid authentication but missing required fields should return 400', async () => {
    const token = jwt.sign(
      {
        id: 999999999,
        role: 'landlord'
      },
      process.env.JWT_SECRET || 'mystay_temporary_secret'
    );

    const res = await request(app)
      .post('/api/stays')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Missing required fields');
  });

});