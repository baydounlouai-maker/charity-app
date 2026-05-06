const pool = require('../config/db');

const listCategories = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, name FROM categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { listCategories };
