const { pool } = require('./server');

afterAll(async () => {
  await pool.end();
});