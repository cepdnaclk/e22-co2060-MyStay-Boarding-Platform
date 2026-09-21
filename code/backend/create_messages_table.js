const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function createMessagesTable() {
    try {
        const caPath = path.join(__dirname, 'ca.pem');
        const sslConfig = fs.existsSync(caPath)
            ? {
                ca: fs.readFileSync(caPath),
                rejectUnauthorized: false,
              }
            : undefined;

        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: sslConfig
        });

        console.log("Checking Messages table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                receiver_id INT NOT NULL,
                stay_id INT,
                message_text TEXT NOT NULL,
                reply_text TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                replied_at TIMESTAMP NULL,
                CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES Users(id) ON DELETE CASCADE,
                CONSTRAINT fk_messages_receiver FOREIGN KEY (receiver_id) REFERENCES Users(id) ON DELETE CASCADE,
                CONSTRAINT fk_messages_stay FOREIGN KEY (stay_id) REFERENCES Stays(stay_id) ON DELETE CASCADE
            )
        `);
        console.log("✅ Messages table created / verified successfully!");
        process.exit(0);
    } catch(err) {
        console.error("❌ Failed to create Messages table:", err);
        process.exit(1);
    }
}

createMessagesTable();
