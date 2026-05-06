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

module.exports = { listAddresses, createAddress, listContacts, createContact };
