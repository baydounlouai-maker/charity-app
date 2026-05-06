const express = require('express');
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

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
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

const PORT = process.env.PORT || 3001;

async function waitForDb(retries = 15, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.execute('SELECT 1');
      return;
    } catch {
      console.log(`[db] waiting for database... (${i + 1}/${retries})`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Database unreachable after retries');
}

waitForDb()
  .then(() => seed())
  .then(() => app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`)))
  .catch((err) => { console.error('[startup] failed:', err.message); process.exit(1); });
