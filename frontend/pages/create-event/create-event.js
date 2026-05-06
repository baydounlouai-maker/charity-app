const user = requireRole('Charity');

document.addEventListener('DOMContentLoaded', async () => {
  initHeader('my-events');
  initFooter();
  await loadSelectors();

  document.getElementById('create-form').addEventListener('submit', handleSubmit);
});

async function loadSelectors() {
  try {
    const [addresses, contacts] = await Promise.all([
      api('/profile/addresses'),
      api('/profile/contacts'),
    ]);

    const addrSel = document.getElementById('address_id');
    const contSel = document.getElementById('contact_id');

    if (!addresses.length) {
      addrSel.innerHTML = '<option value="">No addresses — add one first</option>';
    } else {
      addrSel.innerHTML = '<option value="">Select address…</option>' +
        addresses.map(a => `<option value="${a.id}">${a.label} — ${a.street}, ${a.city}</option>`).join('');
    }

    if (!contacts.length) {
      contSel.innerHTML = '<option value="">No contacts — add one first</option>';
    } else {
      contSel.innerHTML = '<option value="">Select contact…</option>' +
        contacts.map(c => `<option value="${c.id}">${c.label} — ${c.name}</option>`).join('');
    }
  } catch (err) {
    showToast('Failed to load addresses/contacts.', 'error');
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  const errorEl   = document.getElementById('form-error');
  const submitBtn = document.getElementById('submitBtn');
  errorEl.style.display = 'none';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting…';

  try {
    await api('/requests', {
      body: {
        title:          document.getElementById('title').value.trim(),
        category:       document.getElementById('category').value,
        urgency:        document.getElementById('urgency').value,
        description:    document.getElementById('description').value.trim(),
        event_date:     document.getElementById('event_date').value,
        due_date:       document.getElementById('due_date').value,
        required_units: parseInt(document.getElementById('required_units').value),
        address_id:     parseInt(document.getElementById('address_id').value),
        contact_id:     parseInt(document.getElementById('contact_id').value),
      },
    });
    showToast('Event submitted for review!', 'success');
    setTimeout(() => window.location.href = '/pages/my-events/my-events.html', 1200);
  } catch (err) {
    errorEl.textContent   = err.message;
    errorEl.style.display = 'block';
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Submit for Review';
  }
}
