const CATEGORY_ICONS = {
  Money:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  Food:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
  Clothes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>`,
  Medical: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
};

const ICON_LOCATION = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
const ICON_CALENDAR = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

function renderEventCard(event, options = {}) {
  const { showStatus = false, actions = '' } = options;
  const pct = progressPct(event.units_donated, event.required_units);
  const charityName = event.charity?.charity_name || event.charity?.username || 'Unknown';
  const slug = (event.category || '').toLowerCase();
  const icon = CATEGORY_ICONS[event.category] || '';
  const location = [event.address?.city, event.address?.country].filter(Boolean).join(', ');

  return `
    <div class="event-card cat-${slug}" data-id="${event.id}">
      <div class="event-card-header cat-${slug}">
        ${icon}
        <span class="event-card-header-label">${event.category}</span>
        ${urgencyBadge(event.urgency)}
        ${showStatus ? statusBadge(event.status) : ''}
      </div>
      <div class="event-card-body">
        <h3 class="event-card-title">${event.title}</h3>
        <p class="event-card-desc">${event.description}</p>
        <div class="event-card-progress">
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
          <span class="progress-label">${formatUnits(event.units_donated ?? 0, event.category)} / ${formatUnits(event.required_units, event.category)} &bull; ${pct}% funded</span>
        </div>
        <div class="event-card-meta">
          ${location ? `<span class="event-card-meta-item">${ICON_LOCATION} ${location}</span>` : ''}
          <span class="event-card-meta-item">${ICON_CALENDAR} ${formatDateTime(event.event_date)}</span>
        </div>
      </div>
      <div class="event-card-footer">
        <span class="event-card-charity">By ${charityName}</span>
        <a href="/pages/event-detail/event-detail.html?id=${event.id}" class="btn btn-outline btn-sm">View Details</a>
      </div>
      ${actions ? `<div class="event-card-actions">${actions}</div>` : ''}
    </div>`;
}
