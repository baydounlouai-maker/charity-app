const pool = require('../config/db');

const CATEGORIES = ['Money', 'Food', 'Clothes', 'Medical'];
const URGENCIES  = ['Critical', 'High', 'Standard'];

const BASE_SELECT = `
  SELECT r.id, r.title, r.category, r.urgency, r.description,
         r.event_date, r.due_date, r.required_units, r.status, r.created_at,
         COALESCE((
           SELECT SUM(d.donated_units)
           FROM donations d
           WHERE d.request_id = r.id AND d.status IN ('Accepted', 'Finalized')
         ), 0) AS units_donated,
         ua.label AS address_label, ua.street, ua.city, ua.state, ua.zip, ua.country,
         uc.label AS contact_label, uc.name AS contact_name, uc.email AS contact_email, uc.phone AS contact_phone,
         u.id AS charity_id, u.username AS charity_username,
         u.charity_name, u.charity_description
  FROM requests r
  JOIN user_addresses ua ON ua.id = r.address_id
  JOIN user_contacts  uc ON uc.id = r.contact_id
  JOIN users          u  ON u.id  = r.charity_id
`;

function mapRow(r) {
  return {
    id:             r.id,
    title:          r.title,
    category:       r.category,
    urgency:        r.urgency,
    description:    r.description,
    event_date:     r.event_date,
    due_date:       r.due_date,
    required_units: r.required_units,
    units_donated:  r.units_donated,
    status:         r.status,
    created_at:     r.created_at,
    charity: {
      id:                  r.charity_id,
      username:            r.charity_username,
      charity_name:        r.charity_name,
      charity_description: r.charity_description,
    },
    address: {
      label:   r.address_label,
      street:  r.street,
      city:    r.city,
      state:   r.state,
      zip:     r.zip,
      country: r.country,
    },
    contact: {
      label: r.contact_label,
      name:  r.contact_name,
      email: r.contact_email,
      phone: r.contact_phone,
    },
  };
}

const listRequests = async (req, res) => {
  const { category, urgency, search, status } = req.query;

  const conditions = [];
  const params = [];

  if (category) {
    conditions.push('r.category = ?');
    params.push(category);
  }
  if (urgency) {
    conditions.push('r.urgency = ?');
    params.push(urgency);
  }
  if (status) {
    conditions.push('r.status = ?');
    params.push(status);
  }
  if (search) {
    conditions.push('(u.charity_name LIKE ? OR u.username LIKE ? OR r.description LIKE ? OR r.title LIKE ?)');
    const like = `%${search}%`;
    params.push(like, like, like, like);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  try {
    const [rows] = await pool.execute(
      `${BASE_SELECT} ${where} ORDER BY r.created_at DESC`,
      params
    );
    res.json(rows.map(mapRow));
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const listMyRequests = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `${BASE_SELECT} WHERE r.charity_id = ? ORDER BY r.created_at DESC`,
      [req.userId]
    );
    res.json(rows.map(mapRow));
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(
      `${BASE_SELECT} WHERE r.id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Request not found' });
    res.json(mapRow(rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createRequest = async (req, res) => {
  const { title, category, urgency, description, event_date, due_date, required_units, address_id, contact_id } = req.body;

  if (!title || !category || !urgency || !description || !event_date || !due_date || required_units === undefined || !address_id || !contact_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `category must be one of: ${CATEGORIES.join(', ')}` });
  }
  if (!URGENCIES.includes(urgency)) {
    return res.status(400).json({ error: `urgency must be one of: ${URGENCIES.join(', ')}` });
  }

  const now = new Date();
  const evDate = new Date(event_date);
  if (isNaN(evDate.getTime()) || evDate <= now) {
    return res.status(400).json({ error: 'event_date must be in the future' });
  }
  const dueDate = new Date(due_date + 'T00:00:00');
  if (isNaN(dueDate.getTime()) || dueDate <= now) {
    return res.status(400).json({ error: 'due_date must be in the future' });
  }

  try {
    const [[address]] = await pool.execute(
      'SELECT id FROM user_addresses WHERE id = ? AND user_id = ?',
      [address_id, req.userId]
    );
    if (!address) return res.status(400).json({ error: 'Invalid address' });

    const [[contact]] = await pool.execute(
      'SELECT id FROM user_contacts WHERE id = ? AND user_id = ?',
      [contact_id, req.userId]
    );
    if (!contact) return res.status(400).json({ error: 'Invalid contact' });

    const [result] = await pool.execute(
      `INSERT INTO requests (charity_id, title, category, urgency, description, event_date, due_date, required_units, address_id, contact_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, title, category, urgency, description, event_date, due_date, required_units, address_id, contact_id]
    );

    res.status(201).json({ id: result.insertId, status: 'Pending' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const approveRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const [[request]] = await pool.execute('SELECT id, status FROM requests WHERE id = ?', [id]);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'Pending') return res.status(409).json({ error: 'Only Pending requests can be approved' });

    await pool.execute('UPDATE requests SET status = "Approved" WHERE id = ?', [id]);
    res.json({ id: parseInt(id), status: 'Approved' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const rejectRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const [[request]] = await pool.execute('SELECT id, status FROM requests WHERE id = ?', [id]);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'Pending') return res.status(409).json({ error: 'Only Pending requests can be rejected' });

    await pool.execute('UPDATE requests SET status = "Rejected" WHERE id = ?', [id]);
    res.json({ id: parseInt(id), status: 'Rejected' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const cancelRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const [[request]] = await pool.execute('SELECT id, charity_id FROM requests WHERE id = ?', [id]);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.charity_id !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    await pool.execute('UPDATE requests SET status = "Cancelled" WHERE id = ?', [id]);
    await pool.execute(
      'UPDATE donations SET status = "Cancelled" WHERE request_id = ? AND status = "Pending"',
      [id]
    );

    res.json({ id: parseInt(id), status: 'Cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { listRequests, listMyRequests, getRequest, createRequest, approveRequest, rejectRequest, cancelRequest };
