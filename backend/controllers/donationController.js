const pool = require('../config/db');

const createDonation = async (req, res) => {
  const { request_id, donation_type, monetary_amount, description } = req.body;

  if (!request_id || !donation_type || !description) {
    return res.status(400).json({ error: 'request_id, donation_type, and description are required' });
  }
  if (!['monetary', 'resources'].includes(donation_type)) {
    return res.status(400).json({ error: 'donation_type must be "monetary" or "resources"' });
  }
  if (donation_type === 'monetary' && (monetary_amount === undefined || monetary_amount === null)) {
    return res.status(400).json({ error: 'monetary_amount is required for monetary donations' });
  }

  try {
    const [[request]] = await pool.execute('SELECT id FROM requests WHERE id = ?', [request_id]);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const [result] = await pool.execute(
      `INSERT INTO donations (user_id, request_id, donation_type, monetary_amount, description, donation_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.userId, request_id, donation_type, monetary_amount ?? null, description, new Date()]
    );

    res.status(201).json({ id: result.insertId, status: 'Pending' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const listDonationsByRequest = async (req, res) => {
  const { requestId } = req.params;

  try {
    const [[request]] = await pool.execute('SELECT id FROM requests WHERE id = ?', [requestId]);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const [rows] = await pool.execute(
      `SELECT d.id, d.user_id, d.donation_type, d.monetary_amount, d.description,
              d.donation_date, d.status, d.created_at,
              u.username AS donor_username,
              cu.id AS charity_id, cu.username AS charity_username, cu.email AS charity_email
       FROM donations d
       JOIN users    u  ON u.id  = d.user_id
       JOIN requests r  ON r.id  = d.request_id
       JOIN users    cu ON cu.id = r.charity_id
       WHERE d.request_id = ?
       ORDER BY d.created_at DESC`,
      [requestId]
    );

    const donations = rows.map((row) => ({
      id:              row.id,
      user_id:         row.user_id,
      donor_username:  row.donor_username,
      donation_type:   row.donation_type,
      monetary_amount: row.monetary_amount,
      description:     row.description,
      donation_date:   row.donation_date,
      status:          row.status,
      created_at:      row.created_at,
      charity: {
        id:       row.charity_id,
        username: row.charity_username,
        email:    row.charity_email,
      },
    }));

    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const listMyDonations = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT d.id, d.request_id, d.donation_type, d.monetary_amount, d.description,
              d.donation_date, d.status, d.created_at,
              r.description AS request_description, r.due_date AS request_due_date,
              r.status AS request_status,
              c.name AS request_category,
              ua.label AS address_label, ua.street, ua.city, ua.state, ua.zip, ua.country,
              uc.label AS contact_label, uc.name AS contact_name, uc.email AS contact_email, uc.phone AS contact_phone,
              cu.id AS charity_id, cu.username AS charity_username, cu.email AS charity_email
       FROM donations d
       JOIN requests      r  ON r.id  = d.request_id
       JOIN categories    c  ON c.id  = r.category_id
       JOIN user_addresses ua ON ua.id = r.address_id
       JOIN user_contacts  uc ON uc.id = r.contact_id
       JOIN users         cu ON cu.id = r.charity_id
       WHERE d.user_id = ? OR r.charity_id = ?
       ORDER BY d.created_at DESC`,
      [req.userId, req.userId]
    );

    const donations = rows.map((row) => ({
      id:              row.id,
      donation_type:   row.donation_type,
      monetary_amount: row.monetary_amount,
      description:     row.description,
      donation_date:   row.donation_date,
      status:          row.status,
      created_at:      row.created_at,
      request: {
        id:          row.request_id,
        description: row.request_description,
        due_date:    row.request_due_date,
        status:      row.request_status,
        category:    row.request_category,
        charity: {
          id:       row.charity_id,
          username: row.charity_username,
          email:    row.charity_email,
        },
        address: {
          label:   row.address_label,
          street:  row.street,
          city:    row.city,
          state:   row.state,
          zip:     row.zip,
          country: row.country,
        },
        contact: {
          label: row.contact_label,
          name:  row.contact_name,
          email: row.contact_email,
          phone: row.contact_phone,
        },
      },
    }));

    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateDonationStatus = (targetStatus) => async (req, res) => {
  const { id } = req.params;

  try {
    const [[donation]] = await pool.execute(
      'SELECT d.id, d.status, r.charity_id FROM donations d JOIN requests r ON r.id = d.request_id WHERE d.id = ?',
      [id]
    );
    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    if (donation.charity_id !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    await pool.execute('UPDATE donations SET status = ? WHERE id = ?', [targetStatus, id]);

    res.json({ id: parseInt(id), status: targetStatus });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const approveDonation  = updateDonationStatus('Accepted');
const rejectDonation   = updateDonationStatus('Rejected');
const finalizeDonation = updateDonationStatus('Finalized');

const cancelDonation = async (req, res) => {
  const { id } = req.params;

  try {
    const [[donation]] = await pool.execute(
      'SELECT id, user_id FROM donations WHERE id = ?',
      [id]
    );
    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    if (donation.user_id !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    await pool.execute('UPDATE donations SET status = "Cancelled" WHERE id = ?', [id]);

    res.json({ id: parseInt(id), status: 'Cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createDonation, listDonationsByRequest, listMyDonations, approveDonation, rejectDonation, finalizeDonation, cancelDonation };
