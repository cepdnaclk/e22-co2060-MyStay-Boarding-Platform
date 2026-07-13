const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// POST /api/messages - Send a message
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

// GET /api/messages/history/:userId - Get conversation history
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

// GET /api/messages/conversations - Get list of unique users they have chatted with
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

module.exports = router;
