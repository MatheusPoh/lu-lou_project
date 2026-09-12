const api = {
  async request(url, options = {}) {
    const response = await fetch(url, { headers: { ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...options.headers }, ...options });
    if (response.status === 204) return null;
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a operação.');
    return data;
  },
  get(url) { return this.request(url); },
  post(url, body) { return this.request(url, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }); },
  put(url, body) { return this.request(url, { method: 'PUT', body: JSON.stringify(body) }); },
  patch(url, body) { return this.request(url, { method: 'PATCH', body: JSON.stringify(body) }); },
  delete(url) { return this.request(url, { method: 'DELETE' }); },
};

const money = (value) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
const showMessage = (element, text, error = false) => { element.textContent = text; element.className = `message${error ? ' error' : ''}`; element.classList.toggle('hidden', !text); };

async function requireAdmin() {
  try { return (await api.get('/api/auth/me')).user; }
  catch { window.location.href = '/admin/login.html'; return null; }
}

async function logout() {
  await api.post('/api/auth/logout');
  window.location.href = '/admin/login.html';
}
