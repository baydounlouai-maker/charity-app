const user = requireAuth();
const returnTo = getQueryParam('return') || '/pages/contacts/contacts.html';

document.addEventListener('DOMContentLoaded', () => {
  initHeader('');
  initFooter();
  document.querySelector('a[href="/pages/contacts/contacts.html"]').href = returnTo;

  document.getElementById('contact-form').addEventListener('submit', async e => {
    e.preventDefault();
    const errorEl   = document.getElementById('form-error');
    const submitBtn = document.getElementById('submitBtn');
    errorEl.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';

    try {
      await api('/profile/contacts', {
        body: {
          label: document.getElementById('label').value.trim(),
          name:  document.getElementById('name').value.trim(),
          email: document.getElementById('email').value.trim(),
          phone: document.getElementById('phone').value.trim(),
        },
      });
      showToast('Contact saved!', 'success');
      setTimeout(() => window.location.href = returnTo, 800);
    } catch (err) {
      errorEl.textContent   = err.message;
      errorEl.style.display = 'block';
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Save Contact';
    }
  });
});
