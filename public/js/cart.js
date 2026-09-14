const itemsElement = document.querySelector('#cart-items');
const summaryElement = document.querySelector('#cart-summary');
const totalElement = document.querySelector('#cart-total');
const feedbackElement = document.querySelector('#cart-feedback');
let detailedItems = [];
let whatsappNumber = '';

function renderCart() {
  if (!detailedItems.length) {
    itemsElement.innerHTML = '<div class="empty-cart"><h2>Seu carrinho está vazio</h2><p>Escolha os produtos que deseja consultar.</p><a class="button" href="/">Ver produtos</a></div>';
    summaryElement.classList.add('hidden'); return;
  }
  itemsElement.innerHTML = detailedItems.map((item, index) => `
    <article class="cart-item">
      ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">` : '<div class="placeholder">Sem imagem</div>'}
      <div><small class="muted">Tamanho ${escapeHtml(item.size)}</small><h2>${escapeHtml(item.name)}</h2><p class="price">${money(item.price)}</p></div>
      <label>Quantidade<input class="cart-quantity" data-index="${index}" type="number" min="1" max="${item.stock}" value="${item.quantity}"></label>
      <button class="remove-item" data-index="${index}" type="button" aria-label="Remover ${escapeHtml(item.name)}">Remover</button>
    </article>`).join('');
  totalElement.textContent = money(detailedItems.reduce((total, item) => total + item.price * item.quantity, 0));
  summaryElement.classList.remove('hidden');
}

function saveDetailedItems() {
  cart.save(detailedItems.map(({ productId, size, quantity }) => ({ productId, size, quantity })));
  renderCart();
}

itemsElement.addEventListener('input', (event) => {
  if (!event.target.matches('.cart-quantity')) return;
  const item = detailedItems[Number(event.target.dataset.index)];
  item.quantity = Math.max(1, Math.min(Number(event.target.value) || 1, item.stock));
  saveDetailedItems();
});
itemsElement.addEventListener('click', (event) => {
  if (!event.target.matches('.remove-item')) return;
  detailedItems.splice(Number(event.target.dataset.index), 1); saveDetailedItems();
});
document.querySelector('#send-cart').addEventListener('click', () => {
  if (!whatsappNumber) return showMessage(feedbackElement, 'WhatsApp da loja ainda não foi configurado.', true);
  const lines = detailedItems.map((item) => `- ${item.quantity}x ${item.name} | tamanho ${item.size} | ${money(item.price)} cada | subtotal: ${money(item.price * item.quantity)}`);
  const total = detailedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const message = `Olá! Tenho interesse nos seguintes produtos:\n\n${lines.join('\n')}\n\nTotal: ${money(total)}`;
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
});

async function init() {
  const storedItems = cart.get();
  whatsappNumber = (await api.get('/api/config')).whatsappNumber;
  const products = await Promise.all(storedItems.map((item) => api.get(`/api/products/${item.productId}`).catch(() => null)));
  detailedItems = storedItems.map((item, index) => {
    const product = products[index]?.product;
    const size = product?.sizes.find((entry) => entry.size === item.size && entry.stock > 0);
    if (!product || !size) return null;
    return { ...item, quantity: Math.min(item.quantity, size.stock), stock: size.stock, name: product.name, price: product.price, image: product.images[0]?.url };
  }).filter(Boolean);
  saveDetailedItems();
}
init().catch((error) => { itemsElement.innerHTML = `<p class="message error">${escapeHtml(error.message)}</p>`; });
