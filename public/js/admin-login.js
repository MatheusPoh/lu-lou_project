const form = document.querySelector('#login-form');
const message = document.querySelector('#message');
api.get('/api/auth/me').then(() => { location.href = '/admin/index.html'; }).catch(() => {});
form.addEventListener('submit', async (event) => {
  event.preventDefault(); showMessage(message, '');
  const button = form.querySelector('button'); button.disabled = true;
  try { const data = Object.fromEntries(new FormData(form)); await api.post('/api/auth/login', data); location.href = '/admin/index.html'; }
  catch (error) { showMessage(message, error.message, true); button.disabled = false; }
});
