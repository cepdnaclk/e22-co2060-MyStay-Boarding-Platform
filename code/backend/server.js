const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
const allowedOrigins = [
    'http://localhost:5174', 
    'http://localhost:5173', 
    'http://localhost:8081',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow mobile app requests / direct server requests (no origin)
        if (!origin) return callback(null, true);
        
        const isAllowed = allowedOrigins.includes(origin) || 
                          origin.endsWith('.azurestaticapps.net');
        
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true
}));

app.use(express.json());

// --- DATABASE SSL CONFIG ---
const caPath = path.join(__dirname, 'ca.pem');

const sslConfig = fs.existsSync(caPath)
    ? {
        ca: fs.readFileSync(caPath),
        rejectUnauthorized: false,
      }
    : undefined;

// --- DATABASE CONNECTION ---
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // If ca.pem exists, SSL will be used.
    // If ca.pem does not exist, tests will not crash.
    ssl: sslConfig,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
});

// --- TEST DATABASE CONNECTION ONLY WHEN SERVER RUNS DIRECTLY ---
if (require.main === module) {
    pool.getConnection()
        .then(conn => {
            console.log('✅ Database Connected to Aiven Cloud');
            conn.release();
        })
        .catch(err => {
            console.error('❌ DB Connection Failed:', err.message);
        });
}

// --- ATTACH POOL TO REQUEST ---
app.use((req, res, next) => {
    req.pool = pool;
    next();
});

// --- ROUTES ---
const authRoutes = require('./routes/auth');
const stayRoutes = require('./routes/stayRoutes');
const reviewRoutes = require('./routes/reviewRoutes'); // 1. Import your new review routes
const bookingRoutes = require('./routes/bookingRoutes'); // 3. Import booking routes
const messageRoutes = require('./routes/messageRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/stays', stayRoutes);
app.use('/api/reviews', reviewRoutes); // 2. Register the review endpoint
app.use('/api/bookings', bookingRoutes); // 4. Register the booking endpoint
app.use('/api/messages', messageRoutes);

// --- START SERVER ONLY WHEN RUNNING server.js DIRECTLY ---
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 MyStay Server running on http://localhost:${PORT}`);
    });
}

module.exports = { app, pool };
