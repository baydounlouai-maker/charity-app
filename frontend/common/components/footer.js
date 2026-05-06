function renderFooter() {
  return `
    <footer class="app-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="footer-brand-name">♡ United Charity</div>
          <p>The digital bridge connecting donors with high-impact charitable organizations worldwide.</p>
        </div>
        <div class="footer-links">
          <h4>Explore</h4>
          <a href="/pages/discover/discover.html">Discover Events</a>
          <a href="/pages/charities/charities.html">Find Charities</a>
        </div>
        <div class="footer-links">
          <h4>Legal</h4>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
      <div class="footer-copy">© 2026 United Charity System. All rights reserved.</div>
    </footer>`;
}

function initFooter() {
  const el = document.getElementById('app-footer');
  if (el) el.innerHTML = renderFooter();
}
