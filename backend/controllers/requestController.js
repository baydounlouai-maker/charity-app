const pool = require('../config/db');

const listRequests = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT r.id, c.name AS category, r.description, r.due_date, r.status, r.created_at,
              ua.label AS address_label, ua.street, ua.city, ua.state, ua.zip, ua.country,
              uc.label AS contact_label, uc.name AS contact_name, uc.email AS contact_email, uc.phone AS contact_phone,
              u.id AS charity_id, u.username AS charity_username, u.email AS charity_email
       FROM requests r
       JOIN categories    c  ON c.id  = r.category_id
       JOIN user_addresses ua ON ua.id = r.address_id
       JOIN user_contacts  uc ON uc.id = r.contact_id
       JOIN users          u  ON u.id  = r.charity_id
       ORDER BY r.created_at DESC`,
    );

    const requests = rows.map((r) => ({
      id:          r.id,
      category:    r.category,
      description: r.description,
      due_date:    r.due_date,
      status:      r.status,
      created_at:  r.created_at,
      charity: {
        id:       r.charity_id,
        username: r.charity_username,
        email:    r.charity_email,
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
    }));

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createRequest = async (req, res) => {
  const { category_id, description, due_date, address_id, contact_id } = req.body;

  if (!category_id || !description || !due_date || !address_id || !contact_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(due_date + 'T00:00:00');
  if (isNaN(due.getTime()) || due <= today) {
    return res.status(400).json({ error: 'Due date must be in the future' });
  }

  try {
    const [[category]] = await pool.execute('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (!category) return res.status(400).json({ error: 'Invalid category' });

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
      'INSERT INTO requests (charity_id, category_id, description, due_date, address_id, contact_id) VALUES (?, ?, ?, ?, ?, ?)',
      [req.userId, category_id, description, due_date, address_id, contact_id]
    );

    res.status(201).json({ id: result.insertId, status: 'Pending' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateRequestStatus = (targetStatus) => async (req, res) => {
  const { id } = req.params;

  try {
    const [[request]] = await pool.execute(
      'SELECT id FROM requests WHERE id = ?',
      [id]
    );
    if (!request) return res.status(404).json({ error: 'Request not found' });

    await pool.execute('UPDATE requests SET status = ? WHERE id = ?', [targetStatus, id]);
    res.json({ id: parseInt(id), status: targetStatus });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const approveRequest = updateRequestStatus('Approved');
const rejectRequest  = updateRequestStatus('Rejected');

const cancelRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const [[request]] = await pool.execute(
      'SELECT id, charity_id FROM requests WHERE id = ?',
      [id]
    );
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

module.exports = { listRequests, createRequest, approveRequest, rejectRequest, cancelRequest };
