const table = document.querySelector('#products-table');
const message = document.querySelector('#message');
document.querySelector('[data-logout]').addEventListener('click', logout);

async function load() {
  await requireAdmin();
  const products = (await api.get('/api/products?admin=true')).products;
  table.innerHTML = products.length ? products.map((product) => `<tr><td>${escapeHtml(product.name)}</td><td>${escapeHtml(product.category.name)}</td><td>${money(product.price)}</td><td>${product.active ? 'Ativo' : 'Inativo'}</td><td>${product.sizes.reduce((sum, item) => sum + item.stock, 0)}</td><td><div class="actions"><a class="button secondary" href="/admin/product-form.html?id=${product.id}">Editar</a><button class="button secondary" data-status="${product.id}" data-active="${!product.active}">${product.active ? 'Desativar' : 'Ativar'}</button><button class="button danger" data-delete="${product.id}">Excluir</button></div></td></tr>`).join('') : '<tr><td colspan="6">Nenhum produto cadastrado.</td></tr>';
}
async function loadCategories() {
  const categories = (await api.get('/api/categories')).categories;
  document.querySelector('#categories').innerHTML = categories.map((category) => `<div class="size-row"><input data-category-name="${category.id}" value="${escapeHtml(category.name)}"><button class="button secondary" data-category-save="${category.id}">Salvar</button><button class="button danger" data-category-delete="${category.id}">Excluir</button></div>`).join('') || '<p class="muted">Nenhuma categoria.</p>';
}
table.addEventListener('click', async (event) => {
  const statusButton = event.target.closest('[data-status]'); const deleteButton = event.target.closest('[data-delete]');
  try {
    if (statusButton) await api.patch(`/api/products/${statusButton.dataset.status}/status`, { active: statusButton.dataset.active === 'true' });
    if (deleteButton && confirm('Excluir este produto permanentemente?')) await api.delete(`/api/products/${deleteButton.dataset.delete}`);
    if (statusButton || deleteButton) await load();
  } catch (error) { showMessage(message, error.message, true); }
});
document.querySelector('#category-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  try { await api.post('/api/categories', { name: event.target.name.value }); event.target.reset(); await loadCategories(); }
  catch (error) { showMessage(message, error.message, true); }
});
document.querySelector('#categories').addEventListener('click', async (event) => {
  const saveId = event.target.dataset.categorySave; const deleteId = event.target.dataset.categoryDelete;
  try {
    if (saveId) await api.put(`/api/categories/${saveId}`, { name: document.querySelector(`[data-category-name="${saveId}"]`).value });
    if (deleteId && confirm('Excluir esta categoria?')) await api.delete(`/api/categories/${deleteId}`);
    if (saveId || deleteId) await loadCategories();
  } catch (error) { showMessage(message, error.message, true); }
});
Promise.all([load(), loadCategories()]).catch((error) => showMessage(message, error.message, true));
