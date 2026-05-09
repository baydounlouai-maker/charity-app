const pool = require('../config/db');

const createDonation = async (req, res) => {
  const { request_id, donated_units, description, pickup_address, pickup_datetime } = req.body;

  if (!request_id || donated_units === undefined || !description) {
    return res.status(400).json({ error: 'request_id, donated_units, and description are required' });
  }
  if (!Number.isInteger(Number(donated_units)) || Number(donated_units) < 1) {
    return res.status(400).json({ error: 'donated_units must be a positive integer' });
  }

  try {
    const [[request]] = await pool.execute('SELECT id, status FROM requests WHERE id = ?', [request_id]);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'Approved') return res.status(409).json({ error: 'Can only donate to Approved events' });

    const [result] = await pool.execute(
      `INSERT INTO donations (user_id, request_id, donated_units, description, donation_date, pickup_address, pickup_datetime)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, request_id, donated_units, description, new Date(), pickup_address ?? null, pickup_datetime ?? null]
    );

    res.status(201).json({ id: result.insertId, status: 'Pending' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const listDonationsByRequest = async (req, res) => {
  const { requestId } = req.params;

  try {
    const [[request]] = await pool.execute('SELECT id, charity_id FROM requests WHERE id = ?', [requestId]);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const [rows] = await pool.execute(
      `SELECT d.id, d.user_id, d.donated_units, d.description,
              d.donation_date, d.status, d.created_at,
              d.pickup_address, d.pickup_datetime,
              u.username AS donor_username, u.charity_name AS donor_charity_name
       FROM donations d
       JOIN users u ON u.id = d.user_id
       WHERE d.request_id = ?
       ORDER BY d.created_at DESC`,
      [requestId]
    );

    res.json(rows.map((row) => ({
      id:              row.id,
      user_id:         row.user_id,
      donor_username:  row.donor_username,
      donated_units:   row.donated_units,
      description:     row.description,
      donation_date:   row.donation_date,
      status:          row.status,
      created_at:      row.created_at,
      pickup_address:  row.pickup_address,
      pickup_datetime: row.pickup_datetime,
    })));
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const listMyDonations = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT d.id, d.request_id, d.donated_units, d.description,
              d.donation_date, d.status, d.created_at,
              d.pickup_address, d.pickup_datetime,
              r.title AS request_title, r.description AS request_description,
              r.category AS request_category, r.event_date AS request_event_date,
              r.due_date AS request_due_date, r.status AS request_status,
              r.required_units AS request_required_units,
              COALESCE((
                SELECT SUM(d2.donated_units)
                FROM donations d2
                WHERE d2.request_id = r.id AND d2.status IN ('Accepted','Finalized')
              ), 0) AS request_units_donated,
              ua.label AS address_label, ua.street, ua.city, ua.state, ua.zip, ua.country,
              uc.label AS contact_label, uc.name AS contact_name, uc.email AS contact_email, uc.phone AS contact_phone,
              cu.id AS charity_id, cu.username AS charity_username,
              cu.charity_name, cu.charity_description,
              du.username AS donor_username
       FROM donations d
       JOIN requests      r  ON r.id  = d.request_id
       JOIN user_addresses ua ON ua.id = r.address_id
       JOIN user_contacts  uc ON uc.id = r.contact_id
       JOIN users         cu ON cu.id = r.charity_id
       JOIN users         du ON du.id = d.user_id
       WHERE d.user_id = ? OR r.charity_id = ?
       ORDER BY d.created_at DESC`,
      [req.userId, req.userId]
    );

    res.json(rows.map((row) => ({
      id:              row.id,
      donated_units:   row.donated_units,
      description:     row.description,
      donation_date:   row.donation_date,
      status:          row.status,
      created_at:      row.created_at,
      pickup_address:  row.pickup_address,
      pickup_datetime: row.pickup_datetime,
      donor_username:  row.donor_username,
      request: {
        id:             row.request_id,
        title:          row.request_title,
        description:    row.request_description,
        category:       row.request_category,
        event_date:     row.request_event_date,
        due_date:       row.request_due_date,
        status:         row.request_status,
        required_units: row.request_required_units,
        units_donated:  row.request_units_donated,
        charity: {
          id:                  row.charity_id,
          username:            row.charity_username,
          charity_name:        row.charity_name,
          charity_description: row.charity_description,
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
    })));
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateDonationStatus = (targetStatus, allowedFrom) => async (req, res) => {
  const { id } = req.params;

  try {
    const [[donation]] = await pool.execute(
      'SELECT d.id, d.status, r.charity_id FROM donations d JOIN requests r ON r.id = d.request_id WHERE d.id = ?',
      [id]
    );
    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    if (donation.charity_id !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    if (!allowedFrom.includes(donation.status)) {
      return res.status(409).json({ error: `Donation must be ${allowedFrom.join(' or ')} to perform this action` });
    }

    await pool.execute('UPDATE donations SET status = ? WHERE id = ?', [targetStatus, id]);
    res.json({ id: parseInt(id), status: targetStatus });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const approveDonation  = updateDonationStatus('Accepted',  ['Pending']);
const rejectDonation   = updateDonationStatus('Rejected',  ['Pending']);
const finalizeDonation = updateDonationStatus('Finalized', ['Accepted']);

const cancelDonation = async (req, res) => {
  const { id } = req.params;

  try {
    const [[donation]] = await pool.execute('SELECT id, user_id, status FROM donations WHERE id = ?', [id]);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    if (donation.user_id !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    if (donation.status !== 'Pending' && donation.status !== 'Accepted') return res.status(409).json({ error: 'Only Pending or Accepted donations can be cancelled' });

    await pool.execute('UPDATE donations SET status = "Cancelled" WHERE id = ?', [id]);
    res.json({ id: parseInt(id), status: 'Cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createDonation, listDonationsByRequest, listMyDonations, approveDonation, rejectDonation, finalizeDonation, cancelDonation };
