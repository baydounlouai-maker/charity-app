const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const pool = require('../config/db');

router.get('/me', requireAuth, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, charity_name, charity_description, created_at FROM users WHERE id = ?',
      [req.userId]
    );
    const [roleRows] = await pool.execute(
      'SELECT r.name FROM roles r JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = ?',
      [req.userId]
    );
    res.json({ ...users[0], roles: roleRows.map((r) => r.name) });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
