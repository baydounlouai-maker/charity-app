function renderEventCard(event, options = {}) {
  const { showStatus = false, actions = '' } = options;
  const pct = progressPct(event.units_donated, event.required_units);
  const charityName = event.charity?.charity_name || event.charity?.username || 'Unknown';

  return `
    <div class="event-card" data-id="${event.id}">
      <div class="event-card-badges">
        ${categoryBadge(event.category)}
        ${urgencyBadge(event.urgency)}
        ${showStatus ? statusBadge(event.status) : ''}
      </div>
      <h3 class="event-card-title">${event.title}</h3>
      <p class="event-card-desc">${event.description}</p>
      <div class="event-card-progress">
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <span class="progress-label">${formatUnits(event.units_donated ?? 0, event.category)} / ${formatUnits(event.required_units, event.category)} (${pct}%)</span>
      </div>
      <div class="event-card-meta">
        <span>📍 ${event.address?.city || ''}${event.address?.country ? ', ' + event.address.country : ''}</span>
        <span>📅 ${formatDateTime(event.event_date)}</span>
      </div>
      <div class="event-card-footer">
        <span class="event-card-charity">By ${charityName}</span>
        <a href="/pages/event-detail/event-detail.html?id=${event.id}" class="btn btn-outline btn-sm">View Details</a>
      </div>
      ${actions ? `<div class="event-card-actions">${actions}</div>` : ''}
    </div>`;
}
