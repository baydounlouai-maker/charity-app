const pool = require('../config/db');

const listCharities = async (req, res) => {
  const { search } = req.query;

  const conditions = [`r.name = 'Charity'`];
  const params = [];

  if (search) {
    conditions.push('(u.charity_name LIKE ? OR u.username LIKE ?)');
    const like = `%${search}%`;
    params.push(like, like);
  }

  const where = 'WHERE ' + conditions.join(' AND ');

  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.username, u.charity_name, u.charity_description, u.created_at
       FROM users u
       JOIN user_roles ur ON ur.user_id = u.id
       JOIN roles r ON r.id = ur.role_id
       ${where}
       ORDER BY u.charity_name ASC`,
      params
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCharity = async (req, res) => {
  const { id } = req.params;

  try {
    const [users] = await pool.execute(
      `SELECT u.id, u.username, u.charity_name, u.charity_description, u.created_at
       FROM users u
       JOIN user_roles ur ON ur.user_id = u.id
       JOIN roles r ON r.id = ur.role_id
       WHERE u.id = ? AND r.name = 'Charity'`,
      [id]
    );
    if (users.length === 0) return res.status(404).json({ error: 'Charity not found' });

    const [events] = await pool.execute(
      `SELECT r.id, r.title, r.category, r.urgency, r.description, r.event_date, r.due_date,
              r.required_units, r.status,
              COALESCE((
                SELECT SUM(d.donated_units)
                FROM donations d
                WHERE d.request_id = r.id AND d.status IN ('Accepted','Finalized')
              ), 0) AS units_donated
       FROM requests r
       WHERE r.charity_id = ? AND r.status = 'Approved' AND r.event_date >= NOW()
       ORDER BY r.event_date ASC`,
      [id]
    );

    res.json({ ...users[0], events });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { listCharities, getCharity };
