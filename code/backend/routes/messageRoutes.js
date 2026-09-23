const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// ==========================================
// Chat API Endpoints (Private Chat System)
// ==========================================

// POST /api/messages - Send a message (authenticated)
router.post('/', protect, async (req, res) => {
    const { receiver_id, message_text } = req.body;
    const sender_id = req.user.id;
    const pool = req.pool;

    if (!receiver_id || !message_text || message_text.trim() === '') {
        return res.status(400).json({ error: "Receiver ID and message text are required." });
    }

    try {
        // Validate receiver user exists
        const [receiverCheck] = await pool.query('SELECT id FROM Users WHERE id = ?', [receiver_id]);
        if (receiverCheck.length === 0) {
            return res.status(404).json({ error: "Recipient user not found." });
        }

        const query = 'INSERT INTO Messages (sender_id, receiver_id, message_text) VALUES (?, ?, ?)';
        const [result] = await pool.query(query, [sender_id, receiver_id, message_text.trim()]);

        res.status(201).json({
            message: "Message sent successfully!",
            messageId: result.insertId
        });
    } catch (err) {
        console.error("❌ Send Message Error:", err.message);
        res.status(500).json({ error: "Server error while sending message." });
    }
});

// GET /api/messages/history/:userId - Get conversation history (authenticated)
router.get('/history/:userId', protect, async (req, res) => {
    const current_user_id = req.user.id;
    const other_user_id = req.params.userId;
    const pool = req.pool;

    try {
        const query = `
            SELECT id, sender_id, receiver_id, message_text, created_at 
            FROM Messages 
            WHERE (sender_id = ? AND receiver_id = ?) 
               OR (sender_id = ? AND receiver_id = ?) 
            ORDER BY created_at ASC
        `;
        const [rows] = await pool.query(query, [current_user_id, other_user_id, other_user_id, current_user_id]);
        res.json(rows);
    } catch (err) {
        console.error("❌ Get History Error:", err.message);
        res.status(500).json({ error: "Server error while fetching chat history." });
    }
});

// GET /api/messages/conversations - Get list of unique users chatted with (authenticated)
router.get('/conversations', protect, async (req, res) => {
    const current_user_id = req.user.id;
    const pool = req.pool;

    try {
        const query = `
            SELECT 
                U.id as id,
                U.name as name,
                U.email as email,
                U.phone as phone,
                U.role as role,
                M.message_text as lastMessage,
                M.created_at as lastMessageTime
            FROM Users U
            JOIN (
                SELECT 
                    CASE 
                        WHEN sender_id = ? THEN receiver_id 
                        ELSE sender_id 
                    END as contact_id,
                    MAX(id) as max_id
                FROM Messages
                WHERE sender_id = ? OR receiver_id = ?
                GROUP BY contact_id
            ) LastMsgs ON U.id = LastMsgs.contact_id
            JOIN Messages M ON LastMsgs.max_id = M.id
            ORDER BY M.created_at DESC
        `;
        const [rows] = await pool.query(query, [current_user_id, current_user_id, current_user_id]);
        res.json(rows);
    } catch (err) {
        console.error("❌ Get Conversations Error:", err.message);
        res.status(500).json({ error: "Server error while fetching conversations." });
    }
});

// ==========================================
// Stay Inquiry & Landlord Reply Endpoints
// ==========================================

// POST /send - Send a message to landlord (with optional stay_id)
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

// PUT /:messageId/reply - Landlord replies to a message
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

// GET /thread - Fetch message history thread for a specific sender and stay
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

// GET /landlord/:landlordId - Fetch messages sent to a specific landlord
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

// GET /user/:userId - Fetch messages sent by a specific user
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
