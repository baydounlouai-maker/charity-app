function renderCharityCard(charity) {
  const name   = charity.charity_name || charity.username;
  const letter = name.charAt(0).toUpperCase();
  const grad   = getAvatarGradient(name);

  return `
    <div class="charity-card">
      <div class="charity-card-avatar" style="background:${grad}">${letter}</div>
      <h3 class="charity-card-name">${name}</h3>
      <p class="charity-card-desc">${charity.charity_description || 'No description provided.'}</p>
      <a href="/pages/charity-detail/charity-detail.html?id=${charity.id}" class="btn btn-outline btn-sm">View Charity</a>
    </div>`;
}
