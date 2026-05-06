const user = requireRole('Charity');

document.addEventListener('DOMContentLoaded', () => {
  initHeader('my-events');
  initFooter();
  loadMyEvents();
});

async function loadMyEvents() {
  const grid = document.getElementById('events-grid');
  try {
    const events = await api('/requests/my');
    if (!events.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">📋</div>
          <h3>No events yet</h3>
          <p>Create your first charity event to start receiving donations.</p>
          <a href="/pages/create-event/create-event.html" class="btn btn-primary mt-4">Create Event</a>
        </div>`;
      return;
    }
    grid.innerHTML = events.map(ev => {
      let actions = '';
      if (ev.status === 'Pending' || ev.status === 'Approved') {
        actions = `<button class="btn btn-danger btn-sm" onclick="cancelEvent(${ev.id})">Cancel Event</button>`;
      }
      return renderEventCard(ev, { showStatus: true, actions });
    }).join('');
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">⚠️</div><h3>Failed to load</h3><p>${err.message}</p></div>`;
  }
}

async function cancelEvent(id) {
  if (!confirm('Cancel this event? All pending donations will also be cancelled.')) return;
  try {
    await api(`/requests/${id}/cancel`, { method: 'PUT' });
    showToast('Event cancelled.', 'success');
    loadMyEvents();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
