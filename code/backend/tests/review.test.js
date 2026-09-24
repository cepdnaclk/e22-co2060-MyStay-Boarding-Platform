const request = require('supertest');
const { app } = require('../server');

describe('Review API Tests', () => {

  test('POST /api/reviews/add with empty body should fail', async () => {
    const res = await request(app)
      .post('/api/reviews/add')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe(
      'All fields are required (listing_id, user_id, rating, comment).'
    );
  });

  test('POST /api/reviews/add without comment should fail', async () => {
    const res = await request(app)
      .post('/api/reviews/add')
      .send({
        listing_id: 1,
        user_id: 1,
        rating: 5
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe(
      'All fields are required (listing_id, user_id, rating, comment).'
    );
  });

  test('POST /api/reviews/add without rating should fail', async () => {
    const res = await request(app)
      .post('/api/reviews/add')
      .send({
        listing_id: 1,
        user_id: 1,
        comment: 'Test review'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe(
      'All fields are required (listing_id, user_id, rating, comment).'
    );
  });

  test('POST /api/reviews/add with nonexistent user should return 404', async () => {
    const res = await request(app)
      .post('/api/reviews/add')
      .send({
        listing_id: 999999999,
        user_id: 999999999,
        rating: 5,
        comment: 'Test review'
      });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe(
      'User not found. Please log out and log back in.'
    );
  });

  test('GET reviews for nonexistent listing should return an empty array', async () => {
    const res = await request(app)
      .get('/api/reviews/999999999');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

});