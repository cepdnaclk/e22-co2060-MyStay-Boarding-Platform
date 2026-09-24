const request = require('supertest');
const { app } = require('../server');

describe('Booking API Tests', () => {

  // Missing both required fields
  test('POST /api/bookings/add with empty body should fail', async () => {
    const res = await request(app)
      .post('/api/bookings/add')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe(
      'student_id and listing_id are required.'
    );
  });

  // Missing listing_id
  test('POST /api/bookings/add without listing_id should fail', async () => {
    const res = await request(app)
      .post('/api/bookings/add')
      .send({
        student_id: 1
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe(
      'student_id and listing_id are required.'
    );
  });

  // Nonexistent user
  test('POST /api/bookings/add with nonexistent user should return 404', async () => {
    const res = await request(app)
      .post('/api/bookings/add')
      .send({
        student_id: 999999999,
        listing_id: 999999999
      });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('User not found.');
  });

  // Invalid booking status
  test('PUT booking status with invalid status should fail', async () => {
    const res = await request(app)
      .put('/api/bookings/999999999/status')
      .send({
        status: 'invalid'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Invalid status');
  });

  // Valid status but nonexistent booking
  test('PUT nonexistent booking request should return 404', async () => {
    const res = await request(app)
      .put('/api/bookings/999999999/status')
      .send({
        status: 'approved'
      });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Booking request not found');
  });

  // Fetch bookings for nonexistent student
  test('GET bookings for nonexistent student should return an array', async () => {
    const res = await request(app)
      .get('/api/bookings/student/999999999');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  // Fetch bookings for nonexistent landlord
  test('GET bookings for nonexistent landlord should return an array', async () => {
    const res = await request(app)
      .get('/api/bookings/landlord/999999999');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

});