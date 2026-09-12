const productGrid = document.querySelector('#products');
const categorySelect = document.querySelector('#category');
const searchInput = document.querySelector('#search');

function renderProducts(products) {
  if (!products.length) { productGrid.innerHTML = '<p>Nenhum produto encontrado.</p>'; return; }
  productGrid.innerHTML = products.map((product) => `
    <article class="card">
      ${product.images[0] ? `<img src="${escapeHtml(product.images[0].url)}" alt="${escapeHtml(product.name)}">` : '<div class="placeholder">Sem imagem</div>'}
      <div class="card-body">
        <small class="muted">${escapeHtml(product.category.name)}</small>
        <h2>${escapeHtml(product.name)}</h2>
        <p class="price">${money(product.price)}</p>
        <a class="button" href="/produto.html?id=${product.id}">Ver produto</a>
      </div>
    </article>`).join('');
}

async function loadProducts() {
  const params = new URLSearchParams();
  if (searchInput.value.trim()) params.set('search', searchInput.value.trim());
  if (categorySelect.value) params.set('category', categorySelect.value);
  renderProducts((await api.get(`/api/products?${params}`)).products);
}

async function init() {
  const [{ storeName }, { categories }] = await Promise.all([api.get('/api/config'), api.get('/api/categories')]);
  document.querySelectorAll('[data-store-name]').forEach((element) => { element.textContent = storeName; });
  categorySelect.innerHTML += categories.map((category) => `<option value="${escapeHtml(category.slug)}">${escapeHtml(category.name)}</option>`).join('');
  await loadProducts();
}

let searchTimer;
searchInput.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadProducts, 300); });
categorySelect.addEventListener('change', loadProducts);
init().catch((error) => { productGrid.innerHTML = `<p class="message error">${escapeHtml(error.message)}</p>`; });
