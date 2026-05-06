const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const COOKIE_OPTIONS = {
  httpOnly: false,      // FE needs to read it via js-cookie
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const REGISTERABLE_ROLES = ['Charity', 'Donor'];

async function getUserRoles(userId) {
  const [rows] = await pool.execute(
    'SELECT r.name FROM roles r JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = ?',
    [userId]
  );
  return rows.map((r) => r.name);
}

const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!REGISTERABLE_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Role must be Charity or Donor' });
  }

  try {
    const [[roleRow]] = await pool.execute('SELECT id FROM roles WHERE name = ?', [role]);

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashed]
    );
    const userId = result.insertId;

    await pool.execute(
      'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
      [userId, roleRow.id]
    );

    res.cookie('userId', userId, COOKIE_OPTIONS);
    res.status(201).json({ userId, username, email, roles: [role] });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Username or email already in use' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, username, email, password FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const roles = await getUserRoles(user.id);
    res.cookie('userId', user.id, COOKIE_OPTIONS);
    res.json({ userId: user.id, username: user.username, email: user.email, roles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const logout = (req, res) => {
  res.clearCookie('userId');
  res.json({ message: 'Logged out' });
};

module.exports = { register, login, logout };
