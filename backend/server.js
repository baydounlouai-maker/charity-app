const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const pool = require('./config/db');
const seed = require('./seed');
const authRoutes      = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const requestRoutes   = require('./routes/requests');
const profileRoutes   = require('./routes/profile');
const donationRoutes  = require('./routes/donations');
const charityRoutes   = require('./routes/charities');

const PORT = 3001;

const app = express();

const FRONTEND_DIR = path.join(__dirname, '../frontend');

app.use(cors({
  origin: `http://localhost:${PORT}`,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',      authRoutes);
app.use('/api/profile',   profileRoutes);
app.use('/api/requests',  requestRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api',           protectedRoutes);

app.get('/', (req, res) => res.redirect('/pages/homepage/homepage.html'));
app.use(express.static(FRONTEND_DIR));

async function testDbConnection() {
  try {
    await pool.execute('SELECT 1');
  } catch {
    throw new Error('Database unreachable');
  }
}

testDbConnection()
  .then(() => seed())
  .then(() => app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`)))
  .catch((err) => { console.error('[startup] failed:', err.message); process.exit(1); });
