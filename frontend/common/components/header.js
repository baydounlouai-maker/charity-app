function renderHeader(activePage = '') {
  const user = getUser();

  const navLinks = [
    { href: '/pages/homepage/homepage.html',          label: 'Home',             key: 'home',             always: true },
    { href: '/pages/discover/discover.html',          label: 'Discover',         key: 'discover',         always: true },
    { href: '/pages/charities/charities.html',        label: 'Charities',        key: 'charities',        always: true },
    { href: '/pages/my-events/my-events.html',        label: 'My Events',        key: 'my-events',        roles: ['Charity'] },
    { href: '/pages/my-donations/my-donations.html',  label: user?.roles?.includes('Charity') ? 'Donation Management' : 'My Donations', key: 'my-donations', roles: ['Charity', 'Donor'] },
    { href: '/pages/event-management/event-management.html', label: 'Event Management', key: 'event-management', roles: ['Admin'] },
  ];

  const visibleLinks = navLinks.filter(link =>
    link.always || (user && link.roles && link.roles.some(r => user.roles.includes(r)))
  );

  const navHtml = visibleLinks.map(link =>
    `<a href="${link.href}" class="nav-link${activePage === link.key ? ' active' : ''}">${link.label}</a>`
  ).join('');

  let userSection;
  if (user) {
    const isAdminOnly = user.roles.includes('Admin') && !user.roles.includes('Charity') && !user.roles.includes('Donor');
    const roleLabel = `<span class="dropdown-label">${user.roles.join(', ')}</span>`;
    const profileLinks = isAdminOnly ? '' : `
      <a href="/pages/addresses/addresses.html" class="dropdown-item">My Addresses</a>
      <a href="/pages/contacts/contacts.html" class="dropdown-item">My Contacts</a>
      <hr class="dropdown-divider">`;
    const charityLinks = user.roles.includes('Charity') ? `
      <a href="/pages/create-event/create-event.html" class="dropdown-item">Create Event</a>
      <hr class="dropdown-divider">` : '';

    const displayName = user.charity_name || user.username;
    const initial     = displayName.charAt(0).toUpperCase();

    userSection = `
      <div class="header-user">
        <button class="header-username" id="userMenuBtn">
          <span class="header-avatar">${initial}</span>
          ${displayName} <span class="caret">▾</span>
        </button>
        <div class="user-dropdown" id="userDropdown">
          ${roleLabel}${charityLinks}${profileLinks}
          <button class="dropdown-item danger" id="logoutBtn">Log Out</button>
        </div>
      </div>`;
  } else {
    userSection = `
      <div class="header-auth">
        <a href="/pages/login/login.html" class="btn btn-ghost btn-sm">Log In</a>
        <a href="/pages/signup/signup.html" class="btn btn-accent btn-sm">Sign Up</a>
      </div>`;
  }

  return `
    <header class="app-header">
      <div class="header-inner">
        <a href="/pages/homepage/homepage.html" class="header-brand">
          <span class="brand-heart">♡</span> United Charity
        </a>
        <nav class="header-nav">${navHtml}</nav>
        <div class="header-actions">${userSection}</div>
      </div>
    </header>`;
}

function initHeader(activePage = '') {
  const el = document.getElementById('app-header');
  if (!el) return;
  el.innerHTML = renderHeader(activePage);

  const menuBtn  = document.getElementById('userMenuBtn');
  const dropdown = document.getElementById('userDropdown');
  if (menuBtn && dropdown) {
    menuBtn.addEventListener('click', e => { e.stopPropagation(); dropdown.classList.toggle('open'); });
    document.addEventListener('click', () => dropdown.classList.remove('open'));
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try { await api('/auth/logout', { method: 'POST' }); } catch {}
      clearUser();
      window.location.href = '/pages/homepage/homepage.html';
    });
  }
}
