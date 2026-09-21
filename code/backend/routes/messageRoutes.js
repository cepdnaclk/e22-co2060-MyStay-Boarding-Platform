const express = require('express');
const router = express.Router();

// POST - Send a message to landlord
router.post('/send', async (req, res) => {
    const { sender_id, receiver_id, stay_id, message } = req.body;

    console.log("📥 New Message Request:", { sender_id, receiver_id, stay_id, message });

    try {
        if (!sender_id || !receiver_id || !message || !message.trim()) {
            return res.status(400).json({ error: "Sender, receiver, and message content are required." });
        }

        // Validate sender existence
        const [senderCheck] = await req.pool.query('SELECT id FROM Users WHERE id = ?', [sender_id]);
        if (senderCheck.length === 0) {
            return res.status(404).json({ error: "Sender user not found." });
        }

        // Validate receiver existence
        const [receiverCheck] = await req.pool.query('SELECT id FROM Users WHERE id = ?', [receiver_id]);
        if (receiverCheck.length === 0) {
            return res.status(404).json({ error: "Landlord user not found." });
        }

        const query = `
            INSERT INTO Messages (sender_id, receiver_id, stay_id, message_text) 
            VALUES (?, ?, ?, ?)
        `;
        await req.pool.query(query, [sender_id, receiver_id, stay_id || null, message.trim()]);

        console.log("✅ Message sent successfully.");
        res.status(201).json({ message: "Message sent successfully!" });

    } catch (err) {
        console.error("❌ Database Error in sending message:", err.message);
        res.status(500).json({ error: "Internal Server Error: " + err.message });
    }
});

// PUT - Landlord replies to a message
router.put('/:messageId/reply', async (req, res) => {
    const { messageId } = req.params;
    const { reply_text } = req.body;

    console.log("📥 New Reply Request:", { messageId, reply_text });

    try {
        if (!reply_text || !reply_text.trim()) {
            return res.status(400).json({ error: "Reply text is required." });
        }

        const [msgCheck] = await req.pool.query('SELECT id FROM Messages WHERE id = ?', [messageId]);
        if (msgCheck.length === 0) {
            return res.status(404).json({ error: "Message not found." });
        }

        const query = `
            UPDATE Messages 
            SET reply_text = ?, replied_at = NOW() 
            WHERE id = ?
        `;
        await req.pool.query(query, [reply_text.trim(), messageId]);

        console.log("✅ Reply saved successfully.");
        res.json({ message: "Reply sent successfully!" });

    } catch (err) {
        console.error("❌ Database Error in replying to message:", err.message);
        res.status(500).json({ error: "Internal Server Error: " + err.message });
    }
});

// GET - Fetch message history thread for a specific sender and stay
router.get('/thread', async (req, res) => {
    const { sender_id, stay_id } = req.query;

    try {
        if (!sender_id || !stay_id) {
            return res.status(400).json({ error: "sender_id and stay_id query parameters are required." });
        }

        const query = `
            SELECT 
                m.id AS message_id, 
                m.sender_id, 
                u_sender.name AS sender_name, 
                m.receiver_id, 
                u_receiver.name AS landlord_name, 
                m.stay_id, 
                s.title AS stay_title, 
                m.message_text AS message, 
                m.created_at,
                m.reply_text,
                m.replied_at
            FROM Messages m 
            JOIN Users u_sender ON m.sender_id = u_sender.id 
            JOIN Users u_receiver ON m.receiver_id = u_receiver.id 
            LEFT JOIN Stays s ON m.stay_id = s.stay_id 
            WHERE m.sender_id = ? AND m.stay_id = ? 
            ORDER BY m.created_at ASC
        `;

        const [rows] = await req.pool.query(query, [sender_id, stay_id]);
        res.json(rows);

    } catch (err) {
        console.error("❌ Fetch Error for message thread:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET - Fetch messages sent to a specific landlord
router.get('/landlord/:landlordId', async (req, res) => {
    const { landlordId } = req.params;

    try {
        const query = `
            SELECT 
                m.id AS message_id, 
                m.sender_id, 
                u.name AS sender_name, 
                u.email AS sender_email, 
                m.stay_id, 
                s.title AS stay_title, 
                m.message_text AS message, 
                m.created_at,
                m.reply_text,
                m.replied_at
            FROM Messages m 
            JOIN Users u ON m.sender_id = u.id 
            LEFT JOIN Stays s ON m.stay_id = s.stay_id 
            WHERE m.receiver_id = ? 
            ORDER BY m.created_at DESC
        `;

        const [rows] = await req.pool.query(query, [landlordId]);
        res.json(rows);

    } catch (err) {
        console.error("❌ Fetch Error for landlord messages:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET - Fetch messages sent by a specific user
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const query = `
            SELECT 
                m.id AS message_id, 
                m.receiver_id, 
                u.name AS receiver_name, 
                m.stay_id, 
                s.title AS stay_title, 
                m.message_text AS message, 
                m.created_at,
                m.reply_text,
                m.replied_at
            FROM Messages m 
            JOIN Users u ON m.receiver_id = u.id 
            LEFT JOIN Stays s ON m.stay_id = s.stay_id 
            WHERE m.sender_id = ? 
            ORDER BY m.created_at DESC
        `;

        const [rows] = await req.pool.query(query, [userId]);
        res.json(rows);

    } catch (err) {
        console.error("❌ Fetch Error for user messages:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
