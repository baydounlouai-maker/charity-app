const API_URL = '/api';

/* ── Favicon injection ────────────────────────────────────── */
(function() {
  const link = document.createElement('link');
  link.rel  = 'icon';
  link.type = 'image/svg+xml';
  link.href = '/favicon.svg';
  document.head.appendChild(link);
})();

/* ── Avatar gradient ─────────────────────────────────────── */
const _AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#fccb90,#d57eeb)',
  'linear-gradient(135deg,#e0c3fc,#8ec5fc)',
];
function getAvatarGradient(name) {
  const code = (name || ' ').charAt(0).toUpperCase().charCodeAt(0);
  return _AVATAR_GRADIENTS[code % _AVATAR_GRADIENTS.length];
}

/* ── User session ─────────────────────────────────────────── */
function getUser() {
  try { return JSON.parse(localStorage.getItem('uc_user')); } catch { return null; }
}
function setUser(user) { localStorage.setItem('uc_user', JSON.stringify(user)); }
function clearUser()   { localStorage.removeItem('uc_user'); }

function requireAuth() {
  const user = getUser();
  if (!user) { window.location.href = '/pages/login/login.html'; return null; }
  return user;
}
function requireRole(...roles) {
  const user = requireAuth();
  if (!user) return null;
  if (!roles.some(r => user.roles.includes(r))) {
    window.location.href = '/pages/homepage/homepage.html';
    return null;
  }
  return user;
}
function redirectIfLoggedIn() {
  if (getUser()) window.location.href = '/pages/homepage/homepage.html';
}

/* ── API fetch wrapper ────────────────────────────────────── */
async function api(path, options = {}) {
  const { body, method, ...rest } = options;
  const res = await fetch(API_URL + path, {
    method: method || (body !== undefined ? 'POST' : 'GET'),
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(rest.headers || {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

/* ── Formatting helpers ───────────────────────────────────── */
function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/* ── Badge helpers ────────────────────────────────────────── */
const CATEGORY_CLASS = { Money: 'badge-money', Food: 'badge-food', Clothes: 'badge-clothes', Medical: 'badge-medical' };
const URGENCY_CLASS  = { Critical: 'badge-critical', High: 'badge-high', Standard: 'badge-standard' };
const STATUS_CLASS   = { Pending: 'badge-pending', Approved: 'badge-approved', Rejected: 'badge-rejected', Finalized: 'badge-finalized', Cancelled: 'badge-cancelled', Accepted: 'badge-accepted' };

function categoryBadge(cat)  { return `<span class="badge ${CATEGORY_CLASS[cat] || ''}">${cat}</span>`; }
function urgencyBadge(urg)   { return `<span class="badge ${URGENCY_CLASS[urg]  || ''}">${urg}</span>`; }
function statusBadge(status) { return `<span class="badge ${STATUS_CLASS[status] || ''}">${status}</span>`; }

/* ── Progress helper ──────────────────────────────────────── */
function progressPct(donated, required) {
  if (!required || required <= 0) return 0;
  return Math.min(100, Math.round((donated / required) * 100));
}

/* ── Unit formatting ──────────────────────────────────────── */
function formatUnits(amount, category) {
  if (category === 'Money') return `$${Number(amount).toLocaleString('en-US')}`;
  return `${Number(amount).toLocaleString('en-US')} units`;
}
