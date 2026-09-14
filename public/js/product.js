const detail = document.querySelector('#product-detail');
let selectedSize = '';

async function init() {
  const id = new URLSearchParams(location.search).get('id');
  if (!/^\d+$/.test(id || '')) throw new Error('Produto inválido.');
  const [{ product }, config] = await Promise.all([api.get(`/api/products/${id}`), api.get('/api/config')]);
  document.title = `${product.name} | ${config.storeName}`;
  detail.innerHTML = `
    <div>${product.images[0] ? `<img src="${escapeHtml(product.images[0].url)}" alt="${escapeHtml(product.name)}">` : '<div class="placeholder">Sem imagem</div>'}</div>
    <section><small class="muted">${escapeHtml(product.category.name)}</small><h1>${escapeHtml(product.name)}</h1>
      <p>${escapeHtml(product.description)}</p><p class="price">${money(product.price)}</p><strong>Escolha o tamanho:</strong>
      <div class="sizes">${product.sizes.length ? product.sizes.map((item) => `<button class="size" data-size="${escapeHtml(item.size)}" ${item.stock === 0 ? 'disabled title="Sem estoque"' : ''}>${escapeHtml(item.size)}</button>`).join('') : '<span class="muted">Nenhum tamanho cadastrado.</span>'}</div>
      <p id="feedback" class="message hidden"></p><div class="product-actions"><button id="buy" class="button" disabled>Adicionar ao carrinho</button><a class="button secondary" href="/carrinho.html">Ver carrinho</a></div>
    </section>`;
  const buyButton = document.querySelector('#buy');
  detail.querySelectorAll('.size:not(:disabled)').forEach((button) => button.addEventListener('click', () => {
    detail.querySelectorAll('.size').forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected'); selectedSize = button.dataset.size; buyButton.disabled = false;
  }));
  buyButton.addEventListener('click', () => {
    if (!selectedSize) return;
    const selected = product.sizes.find((item) => item.size === selectedSize);
    cart.add(product.id, selectedSize, selected.stock);
    showMessage(document.querySelector('#feedback'), `${product.name}, tamanho ${selectedSize}, foi adicionado ao carrinho.`);
  });
}
init().catch((error) => { detail.innerHTML = `<p class="message error">${escapeHtml(error.message)}</p>`; });
