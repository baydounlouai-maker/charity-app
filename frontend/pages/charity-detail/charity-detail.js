requireAuth();
const charityId = getQueryParam('id');

document.addEventListener('DOMContentLoaded', async () => {
  initHeader('charities');
  initFooter();
  if (!charityId) { window.location.href = '/pages/charities/charities.html'; return; }

  try {
    const charity = await api('/charities/' + charityId);
    renderPage(charity);
  } catch (err) {
    document.getElementById('page-content').innerHTML =
      `<div class="empty-state"><div class="empty-state-icon">⚠️</div><h3>Charity not found</h3><p>${err.message}</p></div>`;
  }
});

function renderPage(charity) {
  const name  = charity.charity_name || charity.username;
  const grad  = getAvatarGradient(name);
  const letter = name.charAt(0).toUpperCase();

  const charityStub = { id: charity.id, charity_name: charity.charity_name, username: charity.username };
  const eventsHtml = charity.events?.length
    ? `<div class="grid-3 mt-6">${charity.events.map(ev => renderEventCard({ ...ev, charity: charityStub })).join('')}</div>`
    : `<div class="empty-state"><div class="empty-state-icon">📅</div><h3>No upcoming events</h3><p>This charity has no approved upcoming events right now.</p></div>`;

  document.getElementById('page-content').innerHTML = `
    <div class="detail-layout">
      <div class="detail-main">
        <h2 style="margin-bottom:var(--sp-6)">Upcoming Events</h2>
        ${eventsHtml}
      </div>

      <div class="detail-sidebar">
        <div class="detail-card" style="text-align:center">
          <div class="charity-card-avatar" style="margin:0 auto var(--sp-4);background:${grad}">${letter}</div>
          <h2 style="color:var(--clr-primary);margin-bottom:var(--sp-3)">${name}</h2>
          ${charity.charity_description
            ? `<p style="color:var(--clr-text-muted);font-size:var(--text-sm);line-height:var(--lh-relaxed)">${charity.charity_description}</p>`
            : '<p class="text-muted text-sm">No description provided.</p>'}
          <hr class="divider">
          <div style="font-size:var(--text-xs);color:var(--clr-text-muted)">Member since ${formatDate(charity.created_at)}</div>
        </div>
      </div>
    </div>`;
}
