const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function seed() {
  const email    = process.env.ADMIN_EMAIL    || 'admin@charapp.local';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const username = 'admin';

  const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) return;

  const hashed = await bcrypt.hash(password, 10);
  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, hashed]
  );

  const [[adminRole]] = await pool.execute("SELECT id FROM roles WHERE name = 'Admin'");
  await pool.execute(
    'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
    [result.insertId, adminRole.id]
  );

  console.log(`[seed] Admin user created — email: ${email}  password: ${password}`);
}

module.exports = seed;
