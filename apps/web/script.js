const state = {
  selectedSize: 'thai-passport',
  quantity: 1,
  cart: [],
  selectedChannel: null,
};

const paymentChannels = [
  { id: 'promptpay', name: 'PromptPay', desc: 'QR Payment', icon: '🏧', color: '#1a8a4a' },
  { id: 'truemoney', name: 'TrueMoney Wallet', desc: 'Wallet / Rabbit Line Pay', icon: '🔵', color: '#e60012' },
  { id: 'scb', name: 'SCB Easy', desc: 'Siam Commercial Bank', icon: '🏦', color: '#4e2e8a' },
  { id: 'kbank', name: 'KBank', desc: 'Kasikorn Bank', icon: '🏦', color: '#0d6b2e' },
  { id: 'bbl', name: 'Bangkok Bank', desc: 'Bualuang iBanking', icon: '🏦', color: '#003d7a' },
  { id: 'ktb', name: 'Krungthai Bank', desc: 'Krungthai NEXT', icon: '🏦', color: '#0a7a3e' },
  { id: 'card', name: 'Credit / Debit Card', desc: 'Visa, Mastercard, JCB', icon: '💳', color: '#1a1a2e' },
];

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
const paymentSection = $('paymentSection');
const paymentTotal = $('paymentTotal');
const paymentChannelsEl = $('paymentChannels');
const payNowBtn = $('payNowBtn');
const payCancelBtn = $('payCancelBtn');
const paymentClose = $('paymentClose');
const loginSection = $('loginSection');
const loginUsername = $('loginUsername');
const loginPassword = $('loginPassword');
const loginError = $('loginError');
const loginSubmitBtn = $('loginSubmitBtn');
const loginCloseBtn = $('loginClose');
const loginLink = $('loginLink');
const adminLink = $('adminLink');

const auth = {
  isLoggedIn: false,
  role: null,
  username: null,
  init() {
    const saved = sessionStorage.getItem('pixellab_auth');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.isLoggedIn = true;
        this.role = data.role;
        this.username = data.username;
        this.updateUI();
      } catch {}
    }
  },
  login(username, password) {
    if (username === 'digitallabs' && password === 'lab1234') {
      this.isLoggedIn = true;
      this.role = 'admin';
      this.username = 'digitallabs';
      sessionStorage.setItem('pixellab_auth', JSON.stringify({ role: 'admin', username: 'digitallabs' }));
      this.updateUI();
      return true;
    }
    if (username.trim() && !password) {
      this.isLoggedIn = true;
      this.role = 'user';
      this.username = username.trim();
      sessionStorage.setItem('pixellab_auth', JSON.stringify({ role: 'user', username: username.trim() }));
      this.updateUI();
      return true;
    }
    return false;
  },
  logout() {
    this.isLoggedIn = false;
    this.role = null;
    this.username = null;
    sessionStorage.removeItem('pixellab_auth');
    document.querySelector('main').classList.remove('admin-mode');
    this.updateUI();
  },
  updateUI() {
    if (this.isLoggedIn && this.role === 'admin') {
      adminLink.style.display = '';
    } else {
      adminLink.style.display = 'none';
      const as = $('adminSection');
      if (as) as.classList.remove('active');
    }
    if (this.isLoggedIn) {
      loginLink.textContent = 'Logout (' + this.username + ')';
    } else {
      loginLink.textContent = 'Login';
    }
  },
};

auth.init();

loginLink.addEventListener('click', e => {
  e.preventDefault();
  if (auth.isLoggedIn) {
    auth.logout();
    showToast('Logged out.');
    return;
  }
  loginUsername.value = '';
  loginPassword.value = '';
  loginError.textContent = '';
  loginSection.classList.add('active');
  loginUsername.focus();
});

function hideLoginModal() {
  loginSection.classList.remove('active');
}

loginSubmitBtn.addEventListener('click', () => {
  const user = loginUsername.value.trim();
  const pass = loginPassword.value;
  if (!user) {
    loginError.textContent = 'Please enter a username.';
    return;
  }
  if (auth.login(user, pass)) {
    hideLoginModal();
    const roleText = auth.role === 'admin' ? 'as Admin' : 'as User';
    showToast('Logged in ' + roleText + '. Welcome, ' + auth.username + '!');
  } else {
    loginError.textContent = 'Invalid credentials.';
  }
});

loginUsername.addEventListener('keydown', e => { if (e.key === 'Enter') loginSubmitBtn.click(); });
loginPassword.addEventListener('keydown', e => { if (e.key === 'Enter') loginSubmitBtn.click(); });
loginCloseBtn.addEventListener('click', hideLoginModal);
loginSection.addEventListener('click', e => { if (e.target === e.currentTarget) hideLoginModal(); });

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

const samplePhotos = [
  `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sp0" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e67330"/><stop offset="100%" stop-color="#1a0a2e"/></linearGradient></defs><rect width="100" height="100" fill="url(#sp0)"/><circle cx="50" cy="35" r="12" fill="#f5c842" opacity="0.8"/><path d="M0 100 L20 60 L40 80 L55 50 L75 70 L100 55 L100 100Z" fill="#2a1a2e" opacity="0.7"/><path d="M0 100 L30 70 L50 85 L70 60 L100 75 L100 100Z" fill="#1a0a1e" opacity="0.5"/></svg>`,
  `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sp1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a3a5e"/><stop offset="100%" stop-color="#0a1a2e"/></linearGradient></defs><rect width="100" height="100" fill="url(#sp1)"/><path d="M0 100 L15 55 L30 70 L50 40 L70 65 L85 50 L100 60 L100 100Z" fill="#2a4a6e" opacity="0.8"/><path d="M0 100 L25 65 L45 80 L60 55 L80 75 L100 70 L100 100Z" fill="#1a3a5e" opacity="0.6"/><circle cx="20" cy="25" r="2" fill="#fff" opacity="0.6"/><circle cx="40" cy="20" r="1.5" fill="#fff" opacity="0.5"/><circle cx="70" cy="30" r="2" fill="#fff" opacity="0.4"/></svg>`,
  `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sp2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2a5a3e"/><stop offset="100%" stop-color="#0a1a0e"/></linearGradient></defs><rect width="100" height="100" fill="url(#sp2)"/><path d="M20 100 L20 70 L30 50 L40 70 L40 100Z" fill="#1a4a2e" opacity="0.8"/><path d="M35 100 L35 65 L45 45 L55 65 L55 100Z" fill="#0a3a1e" opacity="0.9"/><path d="M50 100 L50 75 L60 55 L70 75 L70 100Z" fill="#1a4a2e" opacity="0.7"/><path d="M65 100 L65 70 L75 50 L85 70 L85 100Z" fill="#0a3a1e" opacity="0.8"/></svg>`,
  `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sp3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4a1a5e"/><stop offset="100%" stop-color="#0a0a1e"/></linearGradient></defs><rect width="100" height="100" fill="url(#sp3)"/><circle cx="70" cy="30" r="10" fill="#f5e8c8" opacity="0.7"/><circle cx="66" cy="28" r="10" fill="#4a1a5e"/><circle cx="20" cy="25" r="1.5" fill="#fff" opacity="0.7"/><circle cx="35" cy="18" r="1" fill="#fff" opacity="0.5"/><circle cx="85" cy="22" r="1.5" fill="#fff" opacity="0.6"/><path d="M0 100 L30 75 L50 85 L70 70 L100 80 L100 100Z" fill="#2a0a3e" opacity="0.6"/></svg>`,
  `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sp4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e6a830"/><stop offset="100%" stop-color="#6b3a0a"/></linearGradient></defs><rect width="100" height="100" fill="url(#sp4)"/><circle cx="80" cy="35" r="14" fill="#f5d842" opacity="0.9"/><path d="M0 85 Q25 70 50 80 Q75 65 100 75 L100 100 L0 100Z" fill="#5a2a0a" opacity="0.5"/><path d="M0 95 Q30 80 60 90 Q80 78 100 85 L100 100 L0 100Z" fill="#4a1a0a" opacity="0.4"/></svg>`,
];

document.querySelectorAll('.print-visual').forEach((el, i) => {
  const text = el.textContent.trim();
  const svg = samplePhotos[i % samplePhotos.length];
  el.innerHTML = svg + `<span class="print-badge">${text}</span>`;
});

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
  showPaymentModal();
});

function showPaymentModal() {
  const total = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  paymentTotal.textContent = `${currency.symbol}${total}`;
  state.selectedChannel = null;
  renderPaymentChannels();
  paymentSection.classList.add('active');
}

function renderPaymentChannels() {
  paymentChannelsEl.innerHTML = '';
  paymentChannels.forEach(ch => {
    const div = document.createElement('div');
    div.className = 'payment-channel';
    div.innerHTML = `
      <input type="radio" name="payment" value="${ch.id}" ${state.selectedChannel === ch.id ? 'checked' : ''}>
      <div class="payment-channel-icon" style="background:${ch.color}20;color:${ch.color}">${ch.icon}</div>
      <div class="payment-channel-info">
        <div class="payment-channel-name">${ch.name}</div>
        <div class="payment-channel-desc">${ch.desc}</div>
      </div>
    `;
    div.addEventListener('click', () => {
      state.selectedChannel = ch.id;
      document.querySelectorAll('.payment-channel').forEach(c => c.classList.remove('selected'));
      div.classList.add('selected');
      div.querySelector('input').checked = true;
    });
    paymentChannelsEl.appendChild(div);
  });
}

function hidePaymentModal() {
  paymentSection.classList.remove('active');
}

payNowBtn.addEventListener('click', () => {
  if (!state.selectedChannel) return showToast('Please select a payment method.');
  const channel = paymentChannels.find(c => c.id === state.selectedChannel);
  const total = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const orders = JSON.parse(localStorage.getItem('pixellab_orders')) || [];
  orders.push({
    id: 'ORD' + Date.now(),
    date: new Date().toISOString(),
    items: state.cart.map(i => ({ size: i.size, label: i.label, qty: i.qty, price: i.price })),
    total,
    paymentMethod: state.selectedChannel,
  });
  localStorage.setItem('pixellab_orders', JSON.stringify(orders));
  showToast(`Payment successful via ${channel.name}! Thank you for choosing PixelLab.`);
  state.cart = [];
  state.selectedChannel = null;
  renderCart();
  hidePaymentModal();
});

payCancelBtn.addEventListener('click', hidePaymentModal);
paymentClose.addEventListener('click', hidePaymentModal);

document.getElementById('paymentOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) hidePaymentModal();
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

// ---------- Admin / Report ----------
const adminSection = $('adminSection');
const reportRevenue = $('reportRevenue');
const reportOrders = $('reportOrders');
const reportAvg = $('reportAvg');
const reportChart = $('reportChart');
const reportTableBody = $('reportTableBody');
let activePeriod = 'daily';

$('adminLink').addEventListener('click', e => {
  e.preventDefault();
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  e.currentTarget.classList.add('active');
  document.querySelector('main').classList.add('admin-mode');
  cartSection.style.display = 'none';
  adminSection.classList.add('active');
  loadReport(activePeriod);
});

const reportDropdownBtn = $('reportDropdownBtn');
const reportDropdownMenu = $('reportDropdownMenu');

reportDropdownBtn.addEventListener('click', e => {
  e.stopPropagation();
  reportDropdownMenu.classList.toggle('open');
});

document.querySelectorAll('.report-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.report-option').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    activePeriod = opt.dataset.period;
    reportDropdownBtn.textContent = opt.textContent + ' ▾';
    reportDropdownMenu.classList.remove('open');
    loadReport(activePeriod);
  });
});

document.addEventListener('click', () => {
  reportDropdownMenu.classList.remove('open');
});

function loadReport(period) {
  const orders = JSON.parse(localStorage.getItem('pixellab_orders')) || [];
  if (!orders.length) {
    reportRevenue.textContent = `${currency.symbol}0`;
    reportOrders.textContent = '0';
    reportAvg.textContent = `${currency.symbol}0`;
    reportTableBody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-dim);padding:40px">No orders yet</td></tr>';
    drawChart({ labels: [], values: [] });
    return;
  }
  const groups = groupOrders(orders, period);
  const labels = Object.keys(groups);
  const values = labels.map(l => groups[l].total);
  const counts = labels.map(l => groups[l].count);
  const totalRevenue = values.reduce((a, b) => a + b, 0);
  const totalOrders = counts.reduce((a, b) => a + b, 0);

  reportRevenue.textContent = `${currency.symbol}${totalRevenue}`;
  reportOrders.textContent = totalOrders;
  reportAvg.textContent = `${currency.symbol}${Math.round(totalRevenue / totalOrders)}`;

  reportTableBody.innerHTML = labels.map((l, i) =>
    `<tr><td>${l}</td><td>${counts[i]}</td><td>${currency.symbol}${values[i]}</td></tr>`
  ).join('');

  drawChart({ labels, values, counts });
}

function groupOrders(orders, period) {
  const groups = {};
  orders.forEach(o => {
    const d = new Date(o.date);
    let key;
    switch (period) {
      case 'daily':
        key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        break;
      case 'weekly': {
        const start = new Date(d);
        start.setDate(d.getDate() - d.getDay());
        key = start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        break;
      }
      case 'monthly':
        key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
        break;
      case 'quarterly': {
        const q = Math.ceil((d.getMonth() + 1) / 3);
        key = `Q${q} ${d.getFullYear().toString().slice(-2)}`;
        break;
      }
      case 'halfyear': {
        const h = d.getMonth() < 6 ? 'H1' : 'H2';
        key = `${h} ${d.getFullYear().toString().slice(-2)}`;
        break;
      }
      case 'yearly':
      case '5year':
        key = d.getFullYear().toString();
        break;
    }
    if (!groups[key]) groups[key] = { count: 0, total: 0 };
    groups[key].count += o.items.reduce((s, i) => s + i.qty, 0);
    groups[key].total += o.total;
  });
  const sorted = Object.keys(groups).sort((a, b) => {
    if (period === 'daily' || period === 'weekly') {
      const da = new Date(a);
      const db = new Date(b);
      return da - db;
    }
    return a.localeCompare(b);
  });
  const result = {};
  sorted.forEach(k => { result[k] = groups[k]; });
  return result;
}

function drawChart({ labels, values, counts }) {
  const rect = reportChart.parentElement.getBoundingClientRect();
  const w = Math.max(400, rect.width - 48);
  const h = 300;
  const dpr = window.devicePixelRatio || 1;
  reportChart.width = w * dpr;
  reportChart.height = h * dpr;
  reportChart.style.width = w + 'px';
  reportChart.style.height = h + 'px';
  const ctx = reportChart.getContext('2d');
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, w, h);
  if (!labels.length) {
    ctx.fillStyle = '#666';
    ctx.font = '16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('No data', w / 2, h / 2);
    return;
  }

  const pad = { top: 30, right: 20, bottom: 50, left: 60 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;
  const max = Math.max(...values, 1);
  const barW = Math.min(40, (cw / labels.length) * 0.6);
  const gap = cw / labels.length;

  // Grid lines
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + ch - (ch * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
    ctx.fillStyle = '#666';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(currency.symbol + Math.round((max * i) / 4), pad.left - 8, y + 4);
  }

  // Bars
  labels.forEach((label, i) => {
    const x = pad.left + gap * i + (gap - barW) / 2;
    const barH = (values[i] / max) * ch;
    const y = pad.top + ch - barH;

    ctx.fillStyle = '#e6a830';
    ctx.fillRect(x, y, barW, barH);

    // Value on bar
    if (barH > 20) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(values[i], x + barW / 2, y + 14);
    }

    // Label
    ctx.fillStyle = '#999';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    const maxLabel = 10;
    const displayLabel = label.length > maxLabel ? label.slice(0, maxLabel) + '\u2026' : label;
    ctx.save();
    ctx.translate(x + barW / 2, pad.top + ch + 12);
    ctx.rotate(-Math.PI / 6);
    ctx.fillText(displayLabel, 0, 0);
    ctx.restore();
  });
}

// Seed sample orders for testing if empty
(function seedSampleOrders() {
  const existing = JSON.parse(localStorage.getItem('pixellab_orders')) || [];
  if (existing.length) return;
  const sample = [];
  const now = Date.now();
  const methods = ['promptpay', 'truemoney', 'scb', 'kbank', 'bbl'];
  for (let i = 0; i < 60; i++) {
    const d = new Date(now - i * 86400000 * (1 + Math.random() * 3));
    const itemCount = 1 + Math.floor(Math.random() * 3);
    const items = [];
    let total = 0;
    for (let j = 0; j < itemCount; j++) {
      const sizeKeys = Object.keys(sizes);
      const sk = sizeKeys[Math.floor(Math.random() * sizeKeys.length)];
      const qty = 1 + Math.floor(Math.random() * 5);
      items.push({ size: sk, label: sizes[sk].label, qty, price: sizes[sk].price });
      total += sizes[sk].price * qty;
    }
    sample.push({
      id: 'ORD' + String(now + i * 1000),
      date: d.toISOString(),
      items,
      total,
      paymentMethod: methods[Math.floor(Math.random() * methods.length)],
    });
  }
  localStorage.setItem('pixellab_orders', JSON.stringify(sample));
})();

$('homeLink').addEventListener('click', e => {
  e.preventDefault();
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  e.currentTarget.classList.add('active');
  adminSection.classList.remove('active');
  document.querySelector('main').classList.remove('admin-mode');
  cartSection.style.display = 'none';
});

let toastTimeout;
function showToast(msg) {
  clearTimeout(toastTimeout);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
}
