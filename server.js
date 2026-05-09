const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const pool = require('./config/db');
const seed = require('./config/seed');
const authRoutes      = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const requestRoutes   = require('./routes/requests');
const profileRoutes   = require('./routes/profile');
const donationRoutes  = require('./routes/donations');
const charityRoutes   = require('./routes/charities');
const { default: CONFIG } = require('./config/config');
const initDbIfEmpty = require('./config/initDbIfEmpty');

const app = express();

const PORT = CONFIG.PORT;
const FRONTEND_DIR = path.join(__dirname, './frontend');

// Allow CORS requests from frontend
app.use(cors({
  origin: `http://localhost:${PORT}`,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// API routes
app.use('/api/auth',      authRoutes);
app.use('/api/profile',   profileRoutes);
app.use('/api/requests',  requestRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api',           protectedRoutes);

// Serve the frontend
app.get('/', (req, res) => res.redirect('/pages/homepage/homepage.html'));
app.use(express.static(FRONTEND_DIR));

async function testDbConnection() {
  try {
    await pool.execute('SELECT 1');
  } catch {
    throw new Error('Database unreachable');
  }
}

// Startup
testDbConnection()
  .then(() => initDbIfEmpty())
  .then(() => seed())
  .then(() => app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`)))
  .catch((err) => { console.error('[startup] failed:', err.message); process.exit(1); });
