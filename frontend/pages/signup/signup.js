redirectIfLoggedIn();

let selectedRole = '';

/* ── Password toggle ────────────────────────────────────── */
const toggleBtn = document.getElementById('toggleBtn');
const pwd       = document.getElementById('password');
const iconShow  = document.querySelector('.icon-show');
const iconHide  = document.querySelector('.icon-hide');

toggleBtn.addEventListener('click', () => {
  const isText = pwd.type === 'text';
  pwd.type = isText ? 'password' : 'text';
  iconShow.style.display = isText ? '' : 'none';
  iconHide.style.display = isText ? 'none' : '';
});

/* ── Role selection ─────────────────────────────────────── */
const roleDonorBtn   = document.getElementById('roleDonor');
const roleCharityBtn = document.getElementById('roleCharity');
const charityFields  = document.getElementById('charityFields');

function selectRole(role) {
  selectedRole = role;
  roleDonorBtn.classList.toggle('active',   role === 'Donor');
  roleCharityBtn.classList.toggle('active', role === 'Charity');
  charityFields.style.display = role === 'Charity' ? 'block' : 'none';
}

roleDonorBtn.addEventListener('click',   () => selectRole('Donor'));
roleCharityBtn.addEventListener('click', () => selectRole('Charity'));

/* ── Form submit ────────────────────────────────────────── */
document.getElementById('signup-form').addEventListener('submit', async e => {
  e.preventDefault();
  const errorEl   = document.getElementById('form-error');
  const submitBtn = document.getElementById('submitBtn');
  errorEl.style.display = 'none';

  if (!selectedRole) {
    errorEl.textContent   = 'Please select a role: Donor or Charity.';
    errorEl.style.display = 'block';
    return;
  }

  const body = {
    username: document.getElementById('username').value.trim(),
    password: document.getElementById('password').value,
    role:     selectedRole,
  };

  if (selectedRole === 'Charity') {
    body.charity_name        = document.getElementById('charityName').value.trim();
    body.charity_description = document.getElementById('charityDesc').value.trim();
    if (!body.charity_name) {
      errorEl.textContent   = 'Charity name is required.';
      errorEl.style.display = 'block';
      return;
    }
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account…';

  try {
    const data = await api('/auth/register', { body });
    setUser(data);
    window.location.href = '/pages/homepage/homepage.html';
  } catch (err) {
    errorEl.textContent   = err.message;
    errorEl.style.display = 'block';
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Create Account';
  }
});
