const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const seed = require('./seed');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const requestRoutes = require('./routes/requests');
const categoryRoutes = require('./routes/categories');
const profileRoutes = require('./routes/profile');
const donationRoutes = require('./routes/donations');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api', protectedRoutes);

const PORT = process.env.PORT || 3001;

seed()
  .then(() => app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`)))
  .catch((err) => { console.error('[seed] failed:', err); process.exit(1); });
