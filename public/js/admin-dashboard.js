document.querySelector('[data-logout]').addEventListener('click', logout);
async function init() {
  const user = await requireAdmin(); if (!user) return;
  document.querySelector('#welcome').textContent = `Olá, ${user.name}.`;
  const products = (await api.get('/api/products?admin=true')).products;
  const stats = [
    ['Total de produtos', products.length], ['Ativos', products.filter((p) => p.active).length],
    ['Inativos', products.filter((p) => !p.active).length], ['Sem estoque', products.filter((p) => p.sizes.reduce((sum, item) => sum + item.stock, 0) === 0).length],
  ];
  document.querySelector('#stats').innerHTML = stats.map(([label, value]) => `<div class="stat"><span>${label}</span><strong>${value}</strong></div>`).join('');
}
init();
