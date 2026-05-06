const user = requireAuth();

document.addEventListener('DOMContentLoaded', () => {
  initHeader('my-donations');
  initFooter();
  const isCharity = user.roles.includes('Charity');
  document.getElementById('page-subtitle').textContent = isCharity
    ? 'Review and manage donations made to your events.'
    : 'Track and manage your personal donations.';
  loadDonations();
});

async function loadDonations() {
  const list = document.getElementById('donations-list');
  try {
    const donations = await api('/donations/my');
    if (!donations.length) {
      list.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">💝</div>
          <h3>No donations yet</h3>
          <p>${user.roles.includes('Donor') ? 'Browse events and make your first donation.' : 'No donations have been made to your events yet.'}</p>
          ${user.roles.includes('Donor') ? '<a href="/pages/discover/discover.html" class="btn btn-primary mt-4">Browse Events</a>' : ''}
        </div>`;
      return;
    }
    list.innerHTML = donations.map(d => renderDonationCard(d, user.roles)).join('');
  } catch (err) {
    list.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">⚠️</div><h3>Failed to load</h3><p>${err.message}</p></div>`;
  }
}

async function handleDonationAction(id, action) {
  const actionMap = { approve: 'approve', reject: 'reject', finalize: 'finalize', cancel: 'cancel' };
  try {
    await api(`/donations/${id}/${actionMap[action]}`, { method: 'PUT' });
    showToast('Donation updated successfully.', 'success');
    loadDonations();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
