const request = require('supertest');
const { app } = require('../server');

describe('Message API Tests', () => {

  test('POST /api/messages/send with empty body should fail', async () => {
    const res = await request(app)
      .post('/api/messages/send')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe(
      'Sender, receiver, and message content are required.'
    );
  });

  test('POST /api/messages/send with empty message should fail', async () => {
    const res = await request(app)
      .post('/api/messages/send')
      .send({
        sender_id: 1,
        receiver_id: 2,
        message: ''
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe(
      'Sender, receiver, and message content are required.'
    );
  });

  test('POST /api/messages/send with whitespace-only message should fail', async () => {
    const res = await request(app)
      .post('/api/messages/send')
      .send({
        sender_id: 1,
        receiver_id: 2,
        message: '   '
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe(
      'Sender, receiver, and message content are required.'
    );
  });

  test('POST /api/messages/send with nonexistent sender should return 404', async () => {
    const res = await request(app)
      .post('/api/messages/send')
      .send({
        sender_id: 999999999,
        receiver_id: 999999998,
        stay_id: 999999999,
        message: 'Test message'
      });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Sender user not found.');
  });

  test('PUT reply with empty reply text should fail', async () => {
    const res = await request(app)
      .put('/api/messages/999999999/reply')
      .send({
        reply_text: ''
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Reply text is required.');
  });

  test('PUT reply for nonexistent message should return 404', async () => {
    const res = await request(app)
      .put('/api/messages/999999999/reply')
      .send({
        reply_text: 'Test reply'
      });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Message not found.');
  });

  test('GET message thread without query parameters should fail', async () => {
    const res = await request(app)
      .get('/api/messages/thread');

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe(
      'sender_id and stay_id query parameters are required.'
    );
  });

  test('GET thread for nonexistent sender and stay should return an empty array', async () => {
    const res = await request(app)
      .get('/api/messages/thread')
      .query({
        sender_id: 999999999,
        stay_id: 999999999
      });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('GET messages for nonexistent landlord should return an empty array', async () => {
    const res = await request(app)
      .get('/api/messages/landlord/999999999');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('GET messages for nonexistent user should return an empty array', async () => {
    const res = await request(app)
      .get('/api/messages/user/999999999');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

});