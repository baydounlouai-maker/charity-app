const pool = require('../config/db');

const requireRole = (...allowedRoles) => async (req, res, next) => {
  const userId = req.cookies.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const [users] = await pool.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(401).json({ error: 'Unauthorized' });

    const [roleRows] = await pool.execute(
      'SELECT r.name FROM roles r JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = ?',
      [userId]
    );
    const userRoles = roleRows.map((r) => r.name);

    if (!allowedRoles.some((r) => userRoles.includes(r))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    req.userId = parseInt(userId);
    next();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = requireRole;
