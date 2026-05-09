const user = requireAuth();
const isAdmin   = user?.roles?.includes('Admin');
const isCharity = user?.roles?.includes('Charity');
const isDonor   = user?.roles?.includes('Donor');
const eventId = getQueryParam('id');

document.addEventListener('DOMContentLoaded', () => {
  initHeader('discover');
  initFooter();
  if (!eventId) { window.location.href = '/pages/discover/discover.html'; return; }
  loadEvent();
});

async function loadEvent() {
  try {
    const event = await api('/requests/' + eventId);
    if (!event) throw new Error('Event not found');

    const isMyEvent = isCharity && event.charity?.id === user.userId;
    let donations = null;
    if (isMyEvent) {
      donations = await api('/donations/request/' + eventId);
    } else if (isDonor) {
      const requestDonations = await api('/donations/request/' + eventId);
      donations = requestDonations.filter(d => d.user_id === user.userId);
    }

    renderPage(event, donations);
  } catch (err) {
    document.getElementById('page-content').innerHTML = `
      <div class="empty-state"><div class="empty-state-icon">⚠️</div><h3>Failed to load event</h3><p>${err.message}</p></div>`;
  }
}

function renderPage(ev, donations) {
  const pct = progressPct(ev.units_donated, ev.required_units);

  // Admin bar for pending events
  const adminBar = isAdmin && ev.status === 'Pending' ? `
    <div class="action-bar">
      <p>⚠️ This event is pending your review.</p>
      <div class="action-bar-btns">
        <button class="btn btn-success" id="approveBtn">Approve</button>
        <button class="btn btn-danger"  id="rejectBtn">Reject</button>
      </div>
    </div>` : '';

  // Donate button for donors on approved events
  const donateBtn = isDonor && ev.status === 'Approved' ? `
    <a href="/pages/donate/donate.html?id=${ev.id}" class="btn btn-accent btn-lg w-full mb-4">
      💝 Donate to this Event
    </a>` : '';

  // Donations section — only the owning charity sees it
  const donationsSection = renderDonationsSection(donations);

  document.getElementById('page-content').innerHTML = `
    ${adminBar}
    <div class="detail-layout">
      <div class="detail-main">
        <div class="event-hero">
          <div class="event-hero-badges">
            ${categoryBadge(ev.category)} ${urgencyBadge(ev.urgency)} ${statusBadge(ev.status)}
          </div>
          <h1>${ev.title}</h1>
          <p class="event-hero-desc">${ev.description}</p>
          <div class="event-hero-progress">
            <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
            <div class="progress-stats">
              <span><strong>${formatUnits(ev.units_donated ?? 0, ev.category)}</strong> donated</span>
              <span>Goal: ${formatUnits(ev.required_units, ev.category)} (${pct}%)</span>
            </div>
          </div>
        </div>
        ${donationsSection}
      </div>

      <div class="detail-sidebar">
        ${donateBtn}
        <div class="detail-card">
          <div class="detail-card-title">Event Details</div>
          <div class="detail-meta-row">
            <div class="detail-meta-item">
              <span class="meta-icon">📅</span>
              <div><div class="meta-text">Event Date</div><div class="meta-val">${formatDateTime(ev.event_date)}</div></div>
            </div>
            <div class="detail-meta-item">
              <span class="meta-icon">⏰</span>
              <div><div class="meta-text">Donation Deadline</div><div class="meta-val">${formatDate(ev.due_date)}</div></div>
            </div>
            <div class="detail-meta-item">
              <span class="meta-icon">📍</span>
              <div><div class="meta-text">Location</div><div class="meta-val">${ev.address?.street}, ${ev.address?.city}, ${ev.address?.country}</div></div>
            </div>
          </div>
        </div>

        <div class="detail-card">
          <div class="detail-card-title">Organised by</div>
          <a href="/pages/charity-detail/charity-detail.html?id=${ev.charity?.id}" class="charity-link-block">
            <div style="font-weight:var(--fw-semi);color:var(--clr-primary);margin-bottom:4px">
              ${ev.charity?.charity_name || ev.charity?.username}
            </div>
            ${ev.charity?.charity_description ? `<div style="font-size:var(--text-sm);color:var(--clr-text-muted)">${ev.charity.charity_description}</div>` : ''}
          </a>
        </div>

        <div class="detail-card">
          <div class="detail-card-title">Contact</div>
          <div class="detail-meta-row">
            <div class="detail-meta-item">
              <span class="meta-icon">👤</span>
              <div><div class="meta-text">Name</div><div class="meta-val">${ev.contact?.name}</div></div>
            </div>
            ${ev.contact?.email ? `<div class="detail-meta-item"><span class="meta-icon">✉️</span><div><div class="meta-text">Email</div><div class="meta-val">${ev.contact.email}</div></div></div>` : ''}
            ${ev.contact?.phone ? `<div class="detail-meta-item"><span class="meta-icon">📞</span><div><div class="meta-text">Phone</div><div class="meta-val">${ev.contact.phone}</div></div></div>` : ''}
          </div>
        </div>
      </div>
    </div>`;

  if (isAdmin && ev.status === 'Pending') {
    document.getElementById('approveBtn').addEventListener('click', () => updateEventStatus('approve'));
    document.getElementById('rejectBtn').addEventListener('click',  () => updateEventStatus('reject'));
  }
}

function renderDonationsSection(donations) {
  if (donations === null) return '';
  const sectionTitle = isDonor ? 'My Donations' : 'Donations';
  if (!donations.length) {
    return `<div class="detail-card"><div class="detail-card-title">${sectionTitle} (0)</div><p class="text-muted text-sm">No donations yet.</p></div>`;
  }
  const rows = donations.map(d => `
    <tr id="don-row-${d.id}">
      <td>${d.donor_username}</td>
      <td>${d.donated_units}</td>
      <td>${d.description}</td>
      <td>${formatDate(d.donation_date)}</td>
      <td>${statusBadge(d.status)}</td>
      <td>
        <div class="table-actions">
          ${isCharity && d.status === 'Pending'   ? `<button class="btn btn-success btn-sm" onclick="updateDonation(${d.id},'approve')">Accept</button><button class="btn btn-danger btn-sm" onclick="updateDonation(${d.id},'reject')">Reject</button>` : ''}
          ${isCharity && d.status === 'Accepted'  ? `<button class="btn btn-primary btn-sm" onclick="updateDonation(${d.id},'finalize')">Finalize</button>` : ''}
          ${isDonor && (d.status === 'Pending' || d.status === 'Accepted')  ? `<button class="btn btn-danger btn-sm" onclick="updateDonation(${d.id},'cancel')">Cancel</button>` : ''}
        </div>
      </td>
    </tr>`).join('');

  return `
    <div class="detail-card">
      <div class="detail-card-title">${sectionTitle} (${donations.length})</div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Donor</th><th>Units</th><th>Note</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

async function updateEventStatus(action) {
  try {
    await api(`/requests/${eventId}/${action}`, { method: 'PUT' });
    showToast(`Event ${action === 'approve' ? 'approved' : 'rejected'} successfully.`, 'success');
    loadEvent();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function updateDonation(id, action) {
  try {
    await api(`/donations/${id}/${action}`, { method: 'PUT' });
    showToast('Donation updated.', 'success');
    loadEvent();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
