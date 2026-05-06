redirectIfLoggedIn();

const toggleBtn = document.getElementById('toggleBtn');
const pwd       = document.getElementById('password');
const iconShow  = document.querySelector('.icon-show');
const iconHide  = document.querySelector('.icon-hide');

toggleBtn.addEventListener('click', () => {
  const isText = pwd.type === 'text';
  pwd.type             = isText ? 'password' : 'text';
  iconShow.style.display = isText ? '' : 'none';
  iconHide.style.display = isText ? 'none' : '';
});

document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const errorEl  = document.getElementById('form-error');
  const submitBtn = document.getElementById('submitBtn');
  errorEl.style.display = 'none';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in…';

  try {
    const data = await api('/auth/login', {
      body: {
        username: document.getElementById('username').value.trim(),
        password: document.getElementById('password').value,
      },
    });
    setUser(data);
    window.location.href = '/pages/homepage/homepage.html';
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Log In';
  }
});
