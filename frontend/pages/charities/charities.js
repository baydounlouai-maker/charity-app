requireAuth();

document.addEventListener('DOMContentLoaded', () => {
  initHeader('charities');
  initFooter();
  loadCharities();

  document.getElementById('applyFilter').addEventListener('click', loadCharities);
  document.getElementById('clearFilter').addEventListener('click', () => {
    document.getElementById('filterSearch').value = '';
    loadCharities();
  });
  document.getElementById('filterSearch').addEventListener('keydown', e => {
    if (e.key === 'Enter') loadCharities();
  });
});

async function loadCharities() {
  const grid = document.getElementById('charities-grid');
  grid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><span>Loading…</span></div>';

  const params = new URLSearchParams();
  const search = document.getElementById('filterSearch').value.trim();
  if (search) params.set('search', search);

  try {
    const charities = await api('/charities?' + params);
    if (!charities.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">🏛️</div>
          <h3>No charities found</h3>
          <p>Try a different search term.</p>
        </div>`;
      return;
    }
    grid.innerHTML = charities.map(c => renderCharityCard(c)).join('');
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">⚠️</div><h3>Failed to load</h3><p>${err.message}</p></div>`;
  }
}
