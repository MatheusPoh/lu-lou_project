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
      <p id="feedback" class="message error hidden"></p><button id="buy" class="button" disabled>Comprar pelo WhatsApp</button>
    </section>`;
  const buyButton = document.querySelector('#buy');
  detail.querySelectorAll('.size:not(:disabled)').forEach((button) => button.addEventListener('click', () => {
    detail.querySelectorAll('.size').forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected'); selectedSize = button.dataset.size; buyButton.disabled = false;
  }));
  buyButton.addEventListener('click', () => {
    if (!selectedSize) return;
    if (!config.whatsappNumber) return showMessage(document.querySelector('#feedback'), 'WhatsApp da loja ainda não foi configurado.', true);
    const message = `Olá! Tenho interesse no produto ${product.name}, tamanho ${selectedSize}, no valor de ${money(product.price)}.`;
    window.open(`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  });
}
init().catch((error) => { detail.innerHTML = `<p class="message error">${escapeHtml(error.message)}</p>`; });
