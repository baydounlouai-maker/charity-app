const user = requireAuth();
const returnTo = getQueryParam('return') || '/pages/addresses/addresses.html';

document.addEventListener('DOMContentLoaded', () => {
  initHeader('');
  initFooter();
  document.querySelector('a[href="/pages/addresses/addresses.html"]').href = returnTo;

  document.getElementById('addr-form').addEventListener('submit', async e => {
    e.preventDefault();
    const errorEl   = document.getElementById('form-error');
    const submitBtn = document.getElementById('submitBtn');
    errorEl.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';

    try {
      await api('/profile/addresses', {
        body: {
          label:   document.getElementById('label').value.trim(),
          street:  document.getElementById('street').value.trim(),
          city:    document.getElementById('city').value.trim(),
          state:   document.getElementById('state').value.trim() || null,
          zip:     document.getElementById('zip').value.trim()   || null,
          country: document.getElementById('country').value.trim(),
        },
      });
      showToast('Address saved!', 'success');
      setTimeout(() => window.location.href = returnTo, 800);
    } catch (err) {
      errorEl.textContent   = err.message;
      errorEl.style.display = 'block';
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Save Address';
    }
  });
});
