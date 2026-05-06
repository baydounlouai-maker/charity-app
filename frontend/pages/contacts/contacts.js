const user = requireAuth();

document.addEventListener('DOMContentLoaded', () => {
  initHeader('');
  initFooter();
  loadContacts();
});

async function loadContacts() {
  const list = document.getElementById('contacts-list');
  try {
    const contacts = await api('/profile/contacts');
    if (!contacts.length) {
      list.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">👤</div>
          <h3>No contact information yet</h3>
          <p>Add contact information.</p>
          <a href="/pages/new-contact/new-contact.html" class="btn btn-primary mt-4">Add Contact</a>
        </div>`;
      return;
    }
    list.innerHTML = contacts.map(c => `
      <div class="list-card">
        <div class="list-card-content">
          <h4>${c.label}</h4>
          <p>${c.name}${c.email ? '<br>' + c.email : ''}${c.phone ? '<br>' + c.phone : ''}</p>
        </div>
      </div>`).join('');
  } catch (err) {
    list.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">⚠️</div><h3>Failed to load</h3><p>${err.message}</p></div>`;
  }
}
