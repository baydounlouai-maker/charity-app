const pool = require('../config/db');

const requireAuth = async (req, res, next) => {
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [rows] = await pool.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.userId = parseInt(userId);
    next();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = requireAuth;
