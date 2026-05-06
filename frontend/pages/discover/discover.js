requireAuth();

const PAGE_SIZE = 9;
const URGENCY_ORDER = { Critical: 0, High: 1, Standard: 2 };

let allEvents   = [];
let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {
  initHeader('discover');
  initFooter();
  const preCategory = getQueryParam('category');
  if (preCategory) document.getElementById('filterCategory').value = preCategory;
  loadEvents();

  document.getElementById('applyFilter').addEventListener('click', () => { currentPage = 1; loadEvents(); });
  document.getElementById('clearFilter').addEventListener('click', () => {
    document.getElementById('filterSearch').value   = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterUrgency').value  = '';
    document.getElementById('filterSort').value     = 'date-asc';
    currentPage = 1;
    loadEvents();
  });
  document.getElementById('filterSearch').addEventListener('keydown', e => {
    if (e.key === 'Enter') { currentPage = 1; loadEvents(); }
  });
});

function sortEvents(events, mode) {
  events.sort((a, b) => {
    switch (mode) {
      case 'date-desc':    return new Date(b.event_date) - new Date(a.event_date);
      case 'urgency':      return (URGENCY_ORDER[a.urgency] ?? 9) - (URGENCY_ORDER[b.urgency] ?? 9);
      case 'progress-asc': return progressPct(a.units_donated, a.required_units) - progressPct(b.units_donated, b.required_units);
      default:             return new Date(a.event_date) - new Date(b.event_date);
    }
  });
}

async function loadEvents() {
  const grid = document.getElementById('events-grid');
  grid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><span>Loading…</span></div>';
  document.getElementById('pagination').innerHTML = '';

  const params = new URLSearchParams({ status: 'Approved' });
  const search   = document.getElementById('filterSearch').value.trim();
  const category = document.getElementById('filterCategory').value;
  const urgency  = document.getElementById('filterUrgency').value;
  if (search)   params.set('search',   search);
  if (category) params.set('category', category);
  if (urgency)  params.set('urgency',  urgency);

  try {
    allEvents = await api('/requests?' + params);
    sortEvents(allEvents, document.getElementById('filterSort').value);
    renderPage();
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">⚠️</div><h3>Failed to load events</h3><p>${err.message}</p></div>`;
  }
}

function renderPage() {
  const grid       = document.getElementById('events-grid');
  const info       = document.getElementById('results-info');
  const total      = allEvents.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const start      = (currentPage - 1) * PAGE_SIZE;
  const pageEvents = allEvents.slice(start, start + PAGE_SIZE);

  info.textContent = total
    ? `${total} event${total !== 1 ? 's' : ''} found — page ${currentPage} of ${totalPages}`
    : '';

  if (!total) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">🔍</div>
        <h3>No events found</h3>
        <p>Try adjusting your filters or check back later for new events.</p>
      </div>`;
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  grid.innerHTML = pageEvents.map(ev => renderEventCard(ev)).join('');
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const el = document.getElementById('pagination');
  if (totalPages <= 1) { el.innerHTML = ''; return; }

  const pages = buildPageRange(currentPage, totalPages);

  const items = pages.map(p => {
    if (p === '…') return `<span class="pagination-ellipsis">…</span>`;
    return `<button class="pagination-btn${p === currentPage ? ' active' : ''}" data-page="${p}">${p}</button>`;
  }).join('');

  el.innerHTML = `
    <button class="pagination-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>‹</button>
    ${items}
    <button class="pagination-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;

  el.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = parseInt(btn.dataset.page);
      if (p >= 1 && p <= totalPages && p !== currentPage) {
        currentPage = p;
        renderPage();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}
