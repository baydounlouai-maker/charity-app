function renderDonationCard(donation, userRoles = []) {
  const isCharity = userRoles.includes('Charity');
  const request   = donation.request || {};
  const status    = donation.status || 'Pending';

  let charityActions = '';
  let donorCancel    = '';

  if (isCharity) {
    if (status === 'Pending') {
      charityActions = `
        <div class="dc-charity-actions">
          <button class="btn btn-success btn-sm" onclick="handleDonationAction(${donation.id},'approve')">Accept</button>
          <button class="btn btn-danger btn-sm"  onclick="handleDonationAction(${donation.id},'reject')">Reject</button>
        </div>`;
    } else if (status === 'Accepted') {
      charityActions = `
        <div class="dc-charity-actions">
          <button class="btn btn-primary btn-sm" onclick="handleDonationAction(${donation.id},'finalize')">Mark as Finalized</button>
        </div>`;
    }
  } else if (status === 'Pending') {
    donorCancel = `<button class="btn btn-ghost btn-sm" style="color:var(--clr-danger);border-color:var(--clr-danger)" onclick="handleDonationAction(${donation.id},'cancel')">Cancel</button>`;
  }

  const eventLink = request.id
    ? `<a href="/pages/event-detail/event-detail.html?id=${request.id}" class="link-sm">View Event →</a>`
    : '';

  const pickupBlock = (donation.pickup_address || donation.pickup_datetime) ? `
    <div class="dc-pickup">
      <div class="dc-pickup-label">Pickup Details</div>
      ${donation.pickup_datetime ? `
        <div class="dc-pickup-row">
          <span class="dc-pickup-icon">🕐</span>
          <span>${formatDateTime(donation.pickup_datetime)}</span>
        </div>` : ''}
      ${donation.pickup_address ? `
        <div class="dc-pickup-row">
          <span class="dc-pickup-icon">📍</span>
          <span>${donation.pickup_address}</span>
        </div>` : ''}
    </div>` : '';

  const donorLabel = isCharity
    ? `<span>By <strong>${donation.donor_username || '—'}</strong></span>`
    : `<span style="font-size:var(--text-xs);color:var(--clr-text-muted)">Submitted ${formatDate(donation.donation_date)}</span>`;

  return `
    <div class="donation-card" id="donation-${donation.id}">
      <div class="dc-top">
        <div class="dc-info">
          <div class="dc-event-title">${request.title || 'Event'}</div>
          <div class="dc-badges">
            ${request.category ? categoryBadge(request.category) : ''}
            ${statusBadge(status)}
          </div>
        </div>
        <div class="dc-amount">${formatUnits(donation.donated_units, request.category)}</div>
      </div>

      ${donation.description ? `<p class="dc-note">${donation.description}</p>` : ''}

      ${pickupBlock}

      <div class="dc-footer">
        ${donorLabel}
        <div class="dc-footer-actions">
          ${eventLink}
          ${donorCancel}
        </div>
      </div>

      ${charityActions}
    </div>`;
}
