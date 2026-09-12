const productId = new URLSearchParams(location.search).get('id');
const form = document.querySelector('#product-form');
const message = document.querySelector('#message');
const relations = document.querySelector('#relations');
let product;
document.querySelector('[data-logout]').addEventListener('click', logout);

function renderRelations() {
  document.querySelector('#images').innerHTML = product.images.length ? product.images.map((item) => `<div class="image-row"><img src="${escapeHtml(item.url)}" alt="" width="70"><span>${escapeHtml(item.url.split('/').pop())}</span><button class="button danger" data-image-delete="${item.id}">Excluir</button></div>`).join('') : '<p class="muted">Nenhuma imagem.</p>';
  document.querySelector('#sizes').innerHTML = product.sizes.length ? product.sizes.map((item) => `<div class="size-row"><label>Tamanho<input data-size-name="${item.id}" value="${escapeHtml(item.size)}"></label><label>Estoque<input data-size-stock="${item.id}" type="number" min="0" step="1" value="${item.stock}"></label><button class="button secondary" data-size-save="${item.id}">Salvar</button><button class="button danger" data-size-delete="${item.id}">Excluir</button></div>`).join('') : '<p class="muted">Nenhum tamanho cadastrado.</p>';
}
async function refresh() { product = (await api.get(`/api/products/${productId}?admin=true`)).product; renderRelations(); }
async function init() {
  await requireAdmin();
  const categories = (await api.get('/api/categories')).categories;
  form.categoryId.innerHTML = categories.map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`).join('');
  if (productId) {
    document.querySelector('#title').textContent = 'Editar produto'; relations.classList.remove('hidden');
    product = (await api.get(`/api/products/${productId}?admin=true`)).product;
    for (const field of ['name', 'description', 'price', 'categoryId']) form.elements[field].value = product[field];
    form.active.checked = product.active; renderRelations();
  }
}
form.addEventListener('submit', async (event) => {
  event.preventDefault(); const values = Object.fromEntries(new FormData(form));
  const data = { name: values.name, description: values.description, price: Number(values.price), categoryId: Number(values.categoryId), active: form.active.checked };
  try { const result = productId ? await api.put(`/api/products/${productId}`, data) : await api.post('/api/products', data); if (!productId) location.href = `/admin/product-form.html?id=${result.product.id}`; else showMessage(message, 'Produto salvo com sucesso.'); }
  catch (error) { showMessage(message, error.message, true); }
});
document.querySelector('#image-form').addEventListener('submit', async (event) => {
  event.preventDefault(); try { await api.post(`/api/products/${productId}/images`, new FormData(event.target)); event.target.reset(); await refresh(); } catch (error) { showMessage(message, error.message, true); }
});
document.querySelector('#size-form').addEventListener('submit', async (event) => {
  event.preventDefault(); const values = Object.fromEntries(new FormData(event.target));
  try { await api.post(`/api/products/${productId}/sizes`, { size: values.size, stock: Number(values.stock) }); event.target.reset(); await refresh(); } catch (error) { showMessage(message, error.message, true); }
});
relations.addEventListener('click', async (event) => {
  const imageId = event.target.dataset.imageDelete; const saveId = event.target.dataset.sizeSave; const deleteId = event.target.dataset.sizeDelete;
  try {
    if (imageId && confirm('Excluir esta imagem?')) await api.delete(`/api/products/${productId}/images/${imageId}`);
    if (saveId) await api.put(`/api/products/${productId}/sizes/${saveId}`, { size: document.querySelector(`[data-size-name="${saveId}"]`).value, stock: Number(document.querySelector(`[data-size-stock="${saveId}"]`).value) });
    if (deleteId && confirm('Excluir este tamanho?')) await api.delete(`/api/products/${productId}/sizes/${deleteId}`);
    if (imageId || saveId || deleteId) await refresh();
  } catch (error) { showMessage(message, error.message, true); }
});
init().catch((error) => showMessage(message, error.message, true));
