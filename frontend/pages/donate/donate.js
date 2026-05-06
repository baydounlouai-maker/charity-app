const user = requireRole('Donor');
const eventId = getQueryParam('id');

document.addEventListener('DOMContentLoaded', async () => {
  initHeader('discover');
  initFooter();

  if (!eventId) { window.location.href = '/pages/discover/discover.html'; return; }

  document.getElementById('backBtn').href = `/pages/event-detail/event-detail.html?id=${eventId}`;
  document.getElementById('addAddressBtn').href =
    `/pages/new-address/new-address.html?return=/pages/donate/donate.html?id=${eventId}`;

  loadAddresses();

  try {
    const ev = await api('/requests/' + eventId);
    if (ev.status !== 'Approved') {
      showToast('This event is not accepting donations.', 'warning');
      setTimeout(() => window.location.href = `/pages/event-detail/event-detail.html?id=${eventId}`, 1500);
      return;
    }

    const summary = document.getElementById('event-summary');
    summary.style.display = 'block';
    summary.innerHTML = `
      <div style="font-size:var(--text-xs);text-transform:uppercase;letter-spacing:.05em;color:var(--clr-text-muted);margin-bottom:var(--sp-2)">Donating to</div>
      <div style="font-size:var(--text-lg);font-weight:var(--fw-semi);color:var(--clr-primary);margin-bottom:var(--sp-2)">${ev.title}</div>
      <div style="display:flex;gap:var(--sp-2);flex-wrap:wrap">
        ${categoryBadge(ev.category)} ${urgencyBadge(ev.urgency)}
      </div>
      <div style="margin-top:var(--sp-3);font-size:var(--text-sm);color:var(--clr-text-muted)">
        Goal: ${ev.units_donated ?? 0} / ${ev.required_units} units donated
      </div>`;

    document.getElementById('units-hint').textContent =
      `Category: ${ev.category} — enter the number of ${ev.category.toLowerCase()} units you're contributing.`;
  } catch (err) {
    showToast('Could not load event details.', 'error');
  }

  document.getElementById('donate-form').addEventListener('submit', async e => {
    e.preventDefault();
    const errorEl   = document.getElementById('form-error');
    const submitBtn = document.getElementById('submitBtn');
    errorEl.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    try {
      const pickupAddress  = document.getElementById('pickup_address').value;
      const pickupDatetime = document.getElementById('pickup_datetime').value;
      await api('/donations', {
        body: {
          request_id:      parseInt(eventId),
          donated_units:   parseInt(document.getElementById('donated_units').value),
          description:     document.getElementById('description').value.trim(),
          pickup_address:  pickupAddress  || null,
          pickup_datetime: pickupDatetime || null,
        },
      });
      showToast('Donation submitted! The charity will review it.', 'success');
      setTimeout(() => window.location.href = `/pages/event-detail/event-detail.html?id=${eventId}`, 1500);
    } catch (err) {
      errorEl.textContent   = err.message;
      errorEl.style.display = 'block';
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Submit Donation';
    }
  });
});

async function loadAddresses() {
  const sel = document.getElementById('pickup_address');
  try {
    const addresses = await api('/profile/addresses');
    if (addresses.length) {
      sel.innerHTML = addresses
        .map(a => `<option value="${a.label} — ${a.street}, ${a.city}">${a.label} — ${a.street}, ${a.city}</option>`)
        .join('');
      sel.selectedIndex = 0;
    }
  } catch { /* leave as-is */ }
}
