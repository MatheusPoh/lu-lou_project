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

const cart = {
  key: 'lu-lou-cart',
  get() {
    try {
      const items = JSON.parse(localStorage.getItem(this.key) || '[]');
      return Array.isArray(items) ? items.filter((item) => Number.isInteger(item.productId) && item.productId > 0 && typeof item.size === 'string' && Number.isInteger(item.quantity) && item.quantity > 0) : [];
    } catch { return []; }
  },
  save(items) { localStorage.setItem(this.key, JSON.stringify(items)); this.updateBadges(); },
  add(productId, size, stock) {
    const items = this.get();
    const existing = items.find((item) => item.productId === productId && item.size === size);
    if (existing) existing.quantity = Math.min(existing.quantity + 1, stock);
    else items.push({ productId, size, quantity: 1 });
    this.save(items);
  },
  count() { return this.get().reduce((total, item) => total + item.quantity, 0); },
  updateBadges() {
    document.querySelectorAll('[data-cart-count]').forEach((badge) => {
      const count = this.count();
      badge.textContent = count;
      badge.classList.toggle('hidden', count === 0);
    });
  },
};
cart.updateBadges();

async function requireAdmin() {
  try { return (await api.get('/api/auth/me')).user; }
  catch { window.location.href = '/admin/login.html'; return null; }
}

async function logout() {
  await api.post('/api/auth/logout');
  window.location.href = '/admin/login.html';
}
