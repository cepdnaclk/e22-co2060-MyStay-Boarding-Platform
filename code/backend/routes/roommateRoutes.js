const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Auto-create tables if they don't exist
const initTables = async (pool) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS RoommatePosts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        role VARCHAR(50) DEFAULT 'Student',
        title VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        budget VARCHAR(100),
        gender_pref VARCHAR(50) DEFAULT 'Any',
        description TEXT NOT NULL,
        contact_info VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_roommate_user FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS RoommateReplies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_reply_post FOREIGN KEY (post_id) REFERENCES RoommatePosts(id) ON DELETE CASCADE,
        CONSTRAINT fk_reply_user FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);
  } catch (err) {
    console.error("Error initializing Roommate tables:", err);
  }
};

// GET /api/roommates - Get all posts with their replies
router.get('/', async (req, res) => {
  const pool = req.pool;
  try {
    await initTables(pool);

    const [posts] = await pool.query(`
      SELECT p.*, u.name as user_name, u.email as user_email, u.phone as user_phone
      FROM RoommatePosts p
      JOIN Users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);

    if (posts.length === 0) {
      return res.json([]);
    }

    const postIds = posts.map(p => p.id);
    const [replies] = await pool.query(`
      SELECT r.*, u.name as replier_name
      FROM RoommateReplies r
      JOIN Users u ON r.user_id = u.id
      WHERE r.post_id IN (?)
      ORDER BY r.created_at ASC
    `, [postIds]);

    // Group replies by post_id
    const repliesByPost = {};
    replies.forEach(r => {
      if (!repliesByPost[r.post_id]) repliesByPost[r.post_id] = [];
      repliesByPost[r.post_id].push(r);
    });

    const result = posts.map(p => ({
      ...p,
      replies: repliesByPost[p.id] || []
    }));

    res.json(result);
  } catch (err) {
    console.error("Fetch Roommate Posts Error:", err);
    res.status(500).json({ error: "Server error fetching roommate posts" });
  }
});

// POST /api/roommates - Create a new roommate post
router.post('/', protect, async (req, res) => {
  const pool = req.pool;
  const { title, location, budget, gender_pref, role, description, contact_info } = req.body;

  if (!title || !location || !description) {
    return res.status(400).json({ error: "Title, location, and description are required" });
  }

  try {
    await initTables(pool);

    const query = `
      INSERT INTO RoommatePosts (user_id, role, title, location, budget, gender_pref, description, contact_info)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      req.user.id,
      role || 'Student',
      title,
      location,
      budget || '',
      gender_pref || 'Any',
      description,
      contact_info || ''
    ]);

    res.status(201).json({
      message: "Roommate post created successfully",
      postId: result.insertId
    });
  } catch (err) {
    console.error("Create Roommate Post Error:", err);
    res.status(500).json({ error: "Server error creating roommate post" });
  }
});

// POST /api/roommates/:id/reply - Post a reply
router.post('/:id/reply', protect, async (req, res) => {
  const pool = req.pool;
  const postId = req.params.id;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message cannot be empty" });
  }

  try {
    await initTables(pool);

    const [result] = await pool.query(`
      INSERT INTO RoommateReplies (post_id, user_id, message)
      VALUES (?, ?, ?)
    `, [postId, req.user.id, message.trim()]);

    res.status(201).json({
      message: "Reply posted successfully",
      replyId: result.insertId
    });
  } catch (err) {
    console.error("Post Reply Error:", err);
    res.status(500).json({ error: "Server error posting reply" });
  }
});

// DELETE /api/roommates/:id - Delete a post
router.delete('/:id', protect, async (req, res) => {
  const pool = req.pool;
  const postId = req.params.id;

  try {
    // Verify ownership
    const [rows] = await pool.query('SELECT * FROM RoommatePosts WHERE id = ?', [postId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to delete this post" });
    }

    await pool.query('DELETE FROM RoommatePosts WHERE id = ?', [postId]);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete Post Error:", err);
    res.status(500).json({ error: "Server error deleting post" });
  }
});

module.exports = router;
