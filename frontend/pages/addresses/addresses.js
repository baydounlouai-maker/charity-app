const user = requireAuth();

document.addEventListener('DOMContentLoaded', () => {
  initHeader('');
  initFooter();
  loadAddresses();
});

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
      </div>`).join('');
  } catch (err) {
    list.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">⚠️</div><h3>Failed to load</h3><p>${err.message}</p></div>`;
  }
}
