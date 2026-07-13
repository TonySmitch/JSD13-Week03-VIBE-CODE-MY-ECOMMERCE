const state = {
  selectedSize: 'thai-passport',
  quantity: 1,
  cart: [],
};

const currency = { symbol: '฿', code: 'THB' };

const sizes = {
  '4x6':  { label: '4 × 6 in', price: 15 },
  '5x7':  { label: '5 × 7 in', price: 25 },
  '8x10': { label: '8 × 10 in', price: 50 },
  wallet: { label: 'Wallet (2×3)', price: 10 },
  '8.5x11': { label: '8.5 × 11 in', price: 80 },
  '12x18': { label: '12 × 18 in', price: 120 },
  '18x24': { label: '18 × 24 in', price: 200 },
  '24x36': { label: '24 × 36 in', price: 350 },
  'thai-passport': { label: 'Thai Passport (1.38×1.77)', price: 100 },
  'thai-id': { label: 'Thai ID Card (1.5×2)', price: 80 },
  'thai-dl-1x1': { label: 'Thai DL (1×1)', price: 50 },
  'thai-dl-15': { label: 'Thai DL (1.5×1.5)', price: 70 },
  'thai-15x2': { label: '1.5 × 2 in (Thai)', price: 90 },
};

const $ = id => document.getElementById(id);
const cartItems = $('cartItems');
const cartTotal = $('cartTotal');
const cartSection = $('cartSection');
const cartCount = $('cartCount');
const toast = $('toast');
const addToCartBtn = $('addToCartBtn');
const checkoutBtn = $('checkoutBtn');
const clearCartBtn = $('clearCartBtn');
const cartToggle = $('cartToggle');
const qtyDisplay = $('qtyDisplay');

const defaultImage = (() => {
  const c = document.createElement('canvas');
  c.width = 400; c.height = 300;
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 400, 300);
  grad.addColorStop(0, '#1a1a2e');
  grad.addColorStop(1, '#16213e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 400, 300);
  ctx.fillStyle = '#e6a830';
  ctx.font = 'bold 28px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PixelLab', 200, 150);
  return c.toDataURL();
})();

document.querySelectorAll('.print-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.print-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    state.selectedSize = card.dataset.size;
  });
});
document.querySelector('.print-card').classList.add('selected');

$('qtyPlus').addEventListener('click', () => {
  state.quantity = Math.min(99, state.quantity + 1);
  qtyDisplay.textContent = state.quantity;
});
$('qtyMinus').addEventListener('click', () => {
  state.quantity = Math.max(1, state.quantity - 1);
  qtyDisplay.textContent = state.quantity;
});

addToCartBtn.addEventListener('click', () => {
  const size = state.selectedSize;
  const qty = state.quantity;
  const info = sizes[size];
  const existing = state.cart.findIndex(item => item.size === size);
  if (existing !== -1) {
    state.cart[existing].qty += qty;
  } else {
    state.cart.push({ src: defaultImage, size, qty, label: info.label, price: info.price });
  }
  renderCart();
  showToast(`Added to cart (${info.label} × ${qty})`);
});

function renderCart() {
  if (!state.cart.length) {
    cartSection.style.display = 'none';
    cartCount.textContent = '0';
    return;
  }
  cartSection.style.display = '';
  let total = 0, count = 0;
  cartItems.innerHTML = '';
  state.cart.forEach((item, i) => {
    const lineTotal = item.price * item.qty;
    total += lineTotal;
    count += item.qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.src}" alt="">
      <div class="cart-item-info">
        <div class="cart-item-name">Photo Print</div>
        <div class="cart-item-size">${item.label} × ${item.qty}</div>
      </div>
      <div class="cart-item-price">${currency.symbol}${lineTotal}</div>
      <button class="cart-item-remove" data-index="${i}">&times;</button>
    `;
    cartItems.appendChild(div);
  });
  cartTotal.textContent = `Total: ${currency.symbol}${total}`;
  cartCount.textContent = count;

  cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      state.cart.splice(parseInt(btn.dataset.index), 1);
      renderCart();
      showToast('Item removed.');
    });
  });
}

checkoutBtn.addEventListener('click', () => {
  if (!state.cart.length) return showToast('Cart is empty.');
  showToast('Order placed! Thank you for choosing PixelLab.');
  state.cart = [];
  renderCart();
});

clearCartBtn.addEventListener('click', () => {
  state.cart = [];
  renderCart();
  showToast('Cart cleared.');
});

cartToggle.addEventListener('click', e => {
  e.preventDefault();
  if (!state.cart.length) return showToast('Cart is empty.');
  cartSection.style.display = cartSection.style.display === 'none' ? '' : 'none';
});

let toastTimeout;
function showToast(msg) {
  clearTimeout(toastTimeout);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
}
