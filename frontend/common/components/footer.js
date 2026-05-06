function renderFooter() {
  const user       = getUser();
  const isAdmin    = user?.roles?.includes('Admin');
  const hasProfile = user && !isAdmin;
  const displayName = user ? (user.charity_name || user.username || '') : '';
  const initial     = displayName.charAt(0).toUpperCase();

  const profileBlock = user ? `
        <div class="footer-profile">
          <div class="footer-profile-avatar">${initial}</div>
          <span class="footer-profile-name">${displayName}</span>
        </div>` : '';

  const accountLinks = user ? `
        ${hasProfile ? `
          <a href="/pages/addresses/addresses.html">My Addresses</a>
          <a href="/pages/contacts/contacts.html">My Contacts</a>` : ''}
        <a href="#" id="footerLogoutBtn">Log Out</a>` : `
        <a href="/pages/login/login.html">Log In</a>
        <a href="/pages/signup/signup.html">Sign Up</a>`;

  return `
    <footer class="app-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="footer-brand-name">♡ United Charity</div>
          <p>The digital bridge connecting donors with high-impact charitable organizations — making giving simple, transparent, and effective.</p>
        </div>
        <div class="footer-links">
          <h4>Explore</h4>
          <a href="/pages/homepage/homepage.html">Home</a>
          <a href="/pages/discover/discover.html">Discover Events</a>
          <a href="/pages/charities/charities.html">Find Charities</a>
        </div>
        <div class="footer-links">
          <h4>Account</h4>
          ${profileBlock}
          ${accountLinks}
        </div>
      </div>
      <div class="footer-copy">© 2026 United Charity System. All rights reserved.</div>
    </footer>`;
}

function initFooter() {
  const el = document.getElementById('app-footer');
  if (!el) return;
  el.innerHTML = renderFooter();

  const logoutBtn = document.getElementById('footerLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async e => {
      e.preventDefault();
      try { await api('/auth/logout', { method: 'POST' }); } catch {}
      clearUser();
      window.location.href = '/pages/homepage/homepage.html';
    });
  }
}
