const state = {
  photos: [],
  activeIndex: 0,
  selectedSize: 'thai-passport',
  quantity: 1,
  cart: [],
  filters: { brightness: 100, contrast: 100, exposure: 0, grayscale: 0, hue: 0, saturation: 100, shadows: 0, vibrance: 100, whiteBalance: 0 },
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

// DOM refs
const $ = id => document.getElementById(id);
const uploadZone = $('uploadZone');
const fileInput = $('fileInput');
const editorSection = $('editorSection');
const printSection = $('printSection');
const cartSection = $('cartSection');
const previewImage = $('previewImage');
const thumbnails = $('thumbnails');
const cartItems = $('cartItems');
const cartTotal = $('cartTotal');
const cartCount = $('cartCount');
const toast = $('toast');
const addToCartBtn = $('addToCartBtn');
const checkoutBtn = $('checkoutBtn');
const clearCartBtn = $('clearCartBtn');
const cartToggle = $('cartToggle');
const qtyDisplay = $('qtyDisplay');

// Canvas for filter rendering
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// ---------- Upload ----------
uploadZone.addEventListener('click', () => fileInput.click());

uploadZone.addEventListener('dragover', e => {
  e.preventDefault();
  uploadZone.classList.add('dragover');
});
uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('dragover');
});
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', () => {
  handleFiles(fileInput.files);
});

function handleFiles(files) {
  const valid = [];
  for (const f of files) {
    if (f.type.startsWith('image/')) valid.push(f);
  }
  if (!valid.length) return showToast('Please upload valid image files.');
  Promise.all(valid.map(fileToDataURL)).then(urls => {
    state.photos = state.photos.concat(urls);
    state.activeIndex = state.photos.length - urls.length;
    renderThumbnails();
    showPhoto(state.activeIndex);
    editorSection.style.display = '';
    printSection.style.display = '';
    applyFilters();
  });
}

function fileToDataURL(file) {
  return new Promise(resolve => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.readAsDataURL(file);
  });
}

// ---------- Thumbnails ----------
function renderThumbnails() {
  thumbnails.innerHTML = '';
  state.photos.forEach((url, i) => {
    const img = document.createElement('img');
    img.className = 'thumbnail' + (i === state.activeIndex ? ' active' : '');
    img.src = url;
    img.addEventListener('click', () => {
      state.activeIndex = i;
      renderThumbnails();
      showPhoto(i);
      applyFilters();
    });
    thumbnails.appendChild(img);
  });
}

// ---------- Display ----------
function showPhoto(index) {
  if (!state.photos[index]) return;
  const img = new Image();
  img.onload = () => {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    previewImage.src = canvas.toDataURL();
    previewImage.dataset.original = state.photos[index];
  };
  img.src = state.photos[index];
}

// ---------- Filters ----------
['brightness', 'contrast', 'exposure', 'grayscale', 'hue', 'saturation', 'shadows', 'vibrance', 'whiteBalance'].forEach(name => {
  const el = $(name);
  el.addEventListener('input', () => {
    state.filters[name] = parseInt(el.value);
    applyFilters();
  });
});

$('resetFilters').addEventListener('click', () => {
  state.filters = { brightness: 100, contrast: 100, exposure: 0, grayscale: 0, hue: 0, saturation: 100, shadows: 0, vibrance: 100, whiteBalance: 0 };
  ['brightness','contrast','exposure','grayscale','hue','saturation','shadows','vibrance','whiteBalance'].forEach(n => {
    $(n).value = state.filters[n];
  });
  applyFilters();
});

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [r * 255, g * 255, b * 255];
}

function applyFilters() {
  const idx = state.activeIndex;
  if (!state.photos[idx]) return;
  const img = new Image();
  img.onload = () => {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const f = state.filters;
    const b = f.brightness / 100;
    const c = f.contrast / 100;
    const e = Math.pow(2, f.exposure / 100);
    const g = f.grayscale / 100;
    const h = f.hue / 360;
    const s = f.saturation / 100;
    const sd = f.shadows / 100;
    const v = f.vibrance / 100;
    const wb = f.whiteBalance / 100;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i], gv = data[i+1], bv = data[i+2];

      // Exposure (midtone adjustment using gamma-like curve)
      r = 255 * Math.pow(r / 255, 1 / e);
      gv = 255 * Math.pow(gv / 255, 1 / e);
      bv = 255 * Math.pow(bv / 255, 1 / e);

      // Brightness
      r *= b; gv *= b; bv *= b;

      // Contrast
      r = ((r / 255 - 0.5) * c + 0.5) * 255;
      gv = ((gv / 255 - 0.5) * c + 0.5) * 255;
      bv = ((bv / 255 - 0.5) * c + 0.5) * 255;

      // Vibrance — boost muted colours more than saturated ones
      if (v !== 1) {
        const max = Math.max(r, gv, bv);
        const min = Math.min(r, gv, bv);
        const sat = max - min;
        const boost = 1 + (v - 1) * (1 - sat / 255);
        const gray = 0.299 * r + 0.587 * gv + 0.114 * bv;
        r = gray + (r - gray) * boost;
        gv = gray + (gv - gray) * boost;
        bv = gray + (bv - gray) * boost;
      }

      // Shadows — lift or deepen dark tones
      if (sd !== 0) {
        const gray = 0.299 * r + 0.587 * gv + 0.114 * bv;
        const t = gray / 255;
        const shadowMix = 1 - Math.min(1, t * 3);
        const shift = 1 + sd * shadowMix * 0.5;
        r *= shift; gv *= shift; bv *= shift;
      }

      // White Balance (temperature shift)
      if (wb !== 0) {
        r *= 1 + wb * 0.15;
        bv *= 1 - wb * 0.15;
      }

      // Hue rotation via HSL
      if (h !== 0) {
        let [hh, hs, hl] = rgbToHsl(r, gv, bv);
        hh = (hh + h) % 1;
        [r, gv, bv] = hslToRgb(hh, hs, hl);
      }

      // Grayscale
      if (g > 0) {
        const gray = 0.299 * r + 0.587 * gv + 0.114 * bv;
        r = r + (gray - r) * g;
        gv = gv + (gray - gv) * g;
        bv = bv + (gray - bv) * g;
      }

      // Saturation
      if (s !== 1) {
        const gray = 0.299 * r + 0.587 * gv + 0.114 * bv;
        r = gray + (r - gray) * s;
        gv = gray + (gv - gray) * s;
        bv = gray + (bv - gray) * s;
      }

      data[i]   = clamp(r);
      data[i+1] = clamp(gv);
      data[i+2] = clamp(bv);
    }

    ctx.putImageData(imageData, 0, 0);
    previewImage.src = canvas.toDataURL();
    updatePrintSamples();
  };
  img.src = state.photos[idx];
}

function updatePrintSamples() {
  const src = previewImage.src;
  document.querySelectorAll('.print-sample').forEach(el => {
    el.src = src;
  });
}

function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }

// ---------- Print size selection ----------
document.querySelectorAll('.print-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.print-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    state.selectedSize = card.dataset.size;
  });
});
document.querySelector('.print-card').classList.add('selected');

// ---------- Quantity ----------
$('qtyPlus').addEventListener('click', () => {
  state.quantity = Math.min(99, state.quantity + 1);
  qtyDisplay.textContent = state.quantity;
});
$('qtyMinus').addEventListener('click', () => {
  state.quantity = Math.max(1, state.quantity - 1);
  qtyDisplay.textContent = state.quantity;
});

// ---------- Cart ----------
addToCartBtn.addEventListener('click', () => {
  const idx = state.activeIndex;
  if (!state.photos[idx]) return showToast('No photo selected.');
  const size = state.selectedSize;
  const qty = state.quantity;
  const src = previewImage.src;
  const info = sizes[size];
  const existing = state.cart.findIndex(
    item => item.src === src && item.size === size
  );
  if (existing !== -1) {
    state.cart[existing].qty += qty;
  } else {
    state.cart.push({ src, size, qty, label: info.label, price: info.price });
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

// ---------- Auto Adjust ----------
$('autoAdjustBtn').addEventListener('click', autoAdjust);

function autoAdjust() {
  const idx = state.activeIndex;
  if (!state.photos[idx]) return showToast('No photo to adjust.');
  const img = new Image();
  img.onload = () => {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const len = data.length;

    let min = 255, max = 0;
    let sum = 0, sumSq = 0;
    const hist = new Float32Array(256);
    for (let i = 0; i < len; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
      const v = Math.round(gray);
      hist[v]++;
      sum += gray;
      sumSq += gray * gray;
      if (gray < min) min = gray;
      if (gray > max) max = gray;
    }

    const n = len / 4;
    const mean = sum / n;
    const std = Math.sqrt(sumSq / n - mean * mean);

    let lo = 0, total = 0;
    const clip = n * 0.005;
    for (; lo < 256; lo++) { total += hist[lo]; if (total > clip) break; }
    let hi = 255; total = 0;
    for (; hi >= 0; hi--) { total += hist[hi]; if (total > clip) break; }

    const contrastVal = Math.min(200, Math.max(50, Math.round(100 + (std - 50) * 0.4)));
    const exposureVal = Math.min(100, Math.max(-100, Math.round((mean - 128) * 0.6)));

    let shadowVal = 0;
    if (mean > 100) {
      shadowVal = Math.min(100, Math.round((100 - min) * 0.5));
    }

    const f = state.filters;
    f.brightness = 100;
    f.contrast = contrastVal;
    f.exposure = exposureVal;
    f.grayscale = 0;
    f.hue = 0;
    f.saturation = 110;
    f.shadows = shadowVal;
    f.vibrance = 110;
    f.whiteBalance = 0;

    ['brightness','contrast','exposure','grayscale','hue','saturation','shadows','vibrance','whiteBalance'].forEach(n => {
      $(n).value = f[n];
    });

    applyFilters();
    showToast('Auto adjust applied');
  };
  img.src = state.photos[idx];
}

// ---------- Toast ----------
let toastTimeout;

function showToast(msg) {
  clearTimeout(toastTimeout);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
}
