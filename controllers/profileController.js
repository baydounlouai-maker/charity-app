const pool = require('../config/db');

const listAddresses = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, label, street, city, state, zip, country FROM user_addresses WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createAddress = async (req, res) => {
  const { label, street, city, state, zip, country } = req.body;
  if (!label || !street || !city || !country) {
    return res.status(400).json({ error: 'Label, street, city and country are required' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO user_addresses (user_id, label, street, city, state, zip, country) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.userId, label, street, city, state || null, zip || null, country]
    );
    res.status(201).json({ id: result.insertId, label, street, city, state, zip, country });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const listContacts = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, label, name, email, phone FROM user_contacts WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createContact = async (req, res) => {
  const { label, name, email, phone } = req.body;
  if (!label || !name) {
    return res.status(400).json({ error: 'Label and name are required' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO user_contacts (user_id, label, name, email, phone) VALUES (?, ?, ?, ?, ?)',
      [req.userId, label, name, email || null, phone || null]
    );
    res.status(201).json({ id: result.insertId, label, name, email, phone });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteAddress = async (req, res) => {
  const { id } = req.params;
  try {
    const [[addr]] = await pool.execute(
      'SELECT id FROM user_addresses WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );
    if (!addr) return res.status(404).json({ error: 'Address not found' });

    const [[{ cnt }]] = await pool.execute(
      'SELECT COUNT(*) AS cnt FROM requests WHERE address_id = ?',
      [id]
    );
    if (cnt > 0) return res.status(409).json({ error: 'Cannot delete, address is used by an existing event' });

    await pool.execute('DELETE FROM user_addresses WHERE id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteContact = async (req, res) => {
  const { id } = req.params;
  try {
    const [[contact]] = await pool.execute(
      'SELECT id FROM user_contacts WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );
    if (!contact) return res.status(404).json({ error: 'Contact not found' });

    const [[{ cnt }]] = await pool.execute(
      'SELECT COUNT(*) AS cnt FROM requests WHERE contact_id = ?',
      [id]
    );
    if (cnt > 0) return res.status(409).json({ error: 'Cannot delete, contact is used by an existing event' });

    await pool.execute('DELETE FROM user_contacts WHERE id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { listAddresses, createAddress, deleteAddress, listContacts, createContact, deleteContact };
