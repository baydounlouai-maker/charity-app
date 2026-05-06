document.addEventListener('DOMContentLoaded', () => {
  initHeader('home');
  initFooter();

  // Hide "Get Started" CTA if already logged in
  const user = getUser();
  if (user) {
    const ctaActions = document.getElementById('ctaActions');
    if (ctaActions) {
      ctaActions.innerHTML = `<a href="/pages/discover/discover.html" class="btn btn-accent btn-lg">Explore Events</a>`;
    }
  }
});
