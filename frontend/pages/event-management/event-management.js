const user = requireRole('Admin');

document.addEventListener('DOMContentLoaded', () => {
  initHeader('event-management');
  initFooter();
  loadEvents();

  document.getElementById('applyFilter').addEventListener('click', loadEvents);
  document.getElementById('clearFilter').addEventListener('click', () => {
    document.getElementById('filterStatus').value   = 'Pending';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterSearch').value   = '';
    loadEvents();
  });
  document.getElementById('filterSearch').addEventListener('keydown', e => {
    if (e.key === 'Enter') loadEvents();
  });
});

async function loadEvents() {
  const tbody = document.getElementById('events-tbody');
  const info  = document.getElementById('results-info');
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem"><div class="spinner" style="margin:0 auto"></div></td></tr>`;

  const params = new URLSearchParams();
  const status   = document.getElementById('filterStatus').value;
  const category = document.getElementById('filterCategory').value;
  const search   = document.getElementById('filterSearch').value.trim();
  if (status)   params.set('status',   status);
  if (category) params.set('category', category);
  if (search)   params.set('search',   search);

  try {
    const events = await api('/requests?' + params);
    info.textContent = `${events.length} event${events.length !== 1 ? 's' : ''} found`;

    if (!events.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--clr-text-muted)">No events found.</td></tr>`;
      return;
    }

    tbody.innerHTML = events.map(ev => {
      const charityName = ev.charity?.charity_name || ev.charity?.username;
      const actions = ev.status === 'Pending' ? `
        <div class="table-actions">
          <button class="btn btn-success btn-sm" onclick="updateEvent(${ev.id},'approve')">Approve</button>
          <button class="btn btn-danger btn-sm"  onclick="updateEvent(${ev.id},'reject')">Reject</button>
        </div>` : `<a href="/pages/event-detail/event-detail.html?id=${ev.id}" class="link-sm">View →</a>`;

      return `
        <tr id="ev-row-${ev.id}">
          <td><a href="/pages/event-detail/event-detail.html?id=${ev.id}" class="link-sm">${ev.title}</a></td>
          <td>${charityName}</td>
          <td>${categoryBadge(ev.category)}</td>
          <td>${urgencyBadge(ev.urgency)}</td>
          <td>${formatDateTime(ev.event_date)}</td>
          <td>${statusBadge(ev.status)}</td>
          <td>${actions}</td>
        </tr>`;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--clr-danger);padding:2rem">${err.message}</td></tr>`;
  }
}

async function updateEvent(id, action) {
  try {
    await api(`/requests/${id}/${action}`, { method: 'PUT' });
    showToast(`Event ${action === 'approve' ? 'approved' : 'rejected'}.`, 'success');
    loadEvents();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
