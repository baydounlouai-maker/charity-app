const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#fccb90,#d57eeb)',
  'linear-gradient(135deg,#e0c3fc,#8ec5fc)',
];

function renderCharityCard(charity) {
  const name   = charity.charity_name || charity.username;
  const letter = name.charAt(0).toUpperCase();
  const grad   = AVATAR_GRADIENTS[letter.charCodeAt(0) % AVATAR_GRADIENTS.length];

  return `
    <div class="charity-card">
      <div class="charity-card-avatar" style="background:${grad}">${letter}</div>
      <h3 class="charity-card-name">${name}</h3>
      <p class="charity-card-desc">${charity.charity_description || 'No description provided.'}</p>
      <a href="/pages/charity-detail/charity-detail.html?id=${charity.id}" class="btn btn-outline btn-sm">View Charity</a>
    </div>`;
}
