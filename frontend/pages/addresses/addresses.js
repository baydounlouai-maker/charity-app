const user = requireAuth();

document.addEventListener('DOMContentLoaded', () => {
  initHeader('');
  initFooter();
  loadAddresses();
});

const TRASH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;

async function loadAddresses() {
  const list = document.getElementById('addresses-list');
  try {
    const addresses = await api('/profile/addresses');
    if (!addresses.length) {
      list.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">📍</div>
          <h3>No addresses yet</h3>
          <p>Add an address to use when creating events.</p>
          <a href="/pages/new-address/new-address.html" class="btn btn-primary mt-4">Add Address</a>
        </div>`;
      return;
    }
    list.innerHTML = addresses.map(a => `
      <div class="list-card">
        <div class="list-card-content">
          <h4>${a.label}</h4>
          <p>${a.street}<br>${a.city}${a.state ? ', ' + a.state : ''} ${a.zip || ''}<br>${a.country}</p>
        </div>
        <button class="list-card-delete" data-id="${a.id}" title="Delete address">${TRASH_ICON}</button>
      </div>`).join('');

    list.querySelectorAll('.list-card-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteAddress(btn.dataset.id, btn));
    });
  } catch (err) {
    list.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">⚠️</div><h3>Failed to load</h3><p>${err.message}</p></div>`;
  }
}

async function deleteAddress(id, btn) {
  btn.disabled = true;
  try {
    await api(`/profile/addresses/${id}`, { method: 'DELETE' });
    showToast('Address deleted', 'success');
    loadAddresses();
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false;
  }
}
