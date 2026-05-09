const user = requireAuth();

document.addEventListener('DOMContentLoaded', () => {
  initHeader('');
  initFooter();
  loadContacts();
});

const TRASH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;

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
        <button class="list-card-delete" data-id="${c.id}" title="Delete contact">${TRASH_ICON}</button>
      </div>`).join('');

    list.querySelectorAll('.list-card-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteContact(btn.dataset.id, btn));
    });
  } catch (err) {
    list.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">⚠️</div><h3>Failed to load</h3><p>${err.message}</p></div>`;
  }
}

async function deleteContact(id, btn) {
  btn.disabled = true;
  try {
    await api(`/profile/contacts/${id}`, { method: 'DELETE' });
    showToast('Contact deleted', 'success');
    loadContacts();
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false;
  }
}
