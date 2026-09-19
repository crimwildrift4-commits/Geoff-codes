(() => {
  'use strict';

const PRODUCT = {
    id: 'ASUS-TUF-F15(2022)',
    name: 'ASUS TUF F15(2022) Gaming Laptop',
    img: 'image/TUF15 ASUS.png' 
  };
  const VARIANTS = {
    '16': { label: '16GB RAM · 512GB SSD',  price: 89990,  old: 104990 },
    '32': { label: '32GB RAM · 1TB SSD',    price: 99990,  old: 117990 },
    '64': { label: '64GB RAM · 2TB SSD',    price: 119990, old: 139990 }
  };

  const CART_KEY = 'technest_cart';
  const MAX_QTY = 10;


  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const peso = n => '₱' + Number(n).toLocaleString('en-PH');
  const esc = s => String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  const pad = n => String(n).padStart(2, '0');


  let memoryCart = [];

  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY));
      if (Array.isArray(raw)) {
        return raw.filter(i => i && VARIANTS[i.v] && Number.isInteger(i.qty) && i.qty > 0)
                  .map(i => ({ v: i.v, qty: Math.min(i.qty, MAX_QTY) }));
      }
      return [];
    } catch (e) {
      return memoryCart;
    }
  }

  function saveCart(cart) {
    memoryCart = cart;
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* storage blocked */ }
  }


  function toast(message, type = 'success') {
    const box = $('#toastBox');
    if (!box || !window.bootstrap) return;
    const el = document.createElement('div');
    el.className = `toast align-items-center text-bg-${type} border-0`;
    el.setAttribute('role', 'alert');
    el.innerHTML = `<div class="d-flex">
        <div class="toast-body">${esc(message)}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>`;
    box.appendChild(el);
    el.addEventListener('hidden.bs.toast', () => el.remove());
    new bootstrap.Toast(el, { delay: 2600 }).show();
  }


  function addToCart(vKey, qty = 1) {
    if (!VARIANTS[vKey]) return;
    const cart = loadCart();
    const found = cart.find(i => i.v === vKey);
    if (found) found.qty = Math.min(found.qty + qty, MAX_QTY);
    else cart.push({ v: vKey, qty: Math.min(qty, MAX_QTY) });
    saveCart(cart);
    renderCart();
    toast(`Added to cart: ${PRODUCT.name} (${vKey}GB)`);
  }

  function renderCart() {
    const cart = loadCart();
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const total = cart.reduce((s, i) => s + VARIANTS[i.v].price * i.qty, 0);

    $$('.cart-count').forEach(b => {
      b.textContent = count;
      b.classList.toggle('d-none', count === 0);
    });

    const list = $('#cartItems');
    if (!list) return;
    $('#cartTotal').textContent = peso(total);

    if (!cart.length) {
      list.innerHTML = `<div class="text-center text-muted py-5">
          <i class="bi bi-bag-x display-4"></i>
          <p class="mt-2 mb-3">Your cart is empty.</p>
          <a href="product.html" class="btn btn-brand btn-sm">Browse the laptop</a>
        </div>`;
      return;
    }

    list.innerHTML = cart.map(i => {
      const v = VARIANTS[i.v];
      return `<div class="cart-item">
          <img src="${esc(PRODUCT.img)}" alt="">
          <div class="flex-grow-1">
            <div class="fw-semibold small">${esc(PRODUCT.name)}</div>
            <div class="text-muted small">${esc(v.label)}</div>
            <div class="d-flex align-items-center gap-2 mt-1 qty-mini">
              <button type="button" data-action="dec" data-v="${esc(i.v)}" aria-label="Decrease quantity">−</button>
              <span class="small fw-semibold">${i.qty}</span>
              <button type="button" data-action="inc" data-v="${esc(i.v)}" aria-label="Increase quantity">+</button>
              <button type="button" class="btn btn-link btn-sm text-danger ms-auto p-0" data-action="remove" data-v="${esc(i.v)}">Remove</button>
            </div>
          </div>
          <div class="fw-bold small text-nowrap">${peso(v.price * i.qty)}</div>
        </div>`;
    }).join('');
  }

  function buildSharedUI() {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="offcanvas offcanvas-end" tabindex="-1" id="cartCanvas" aria-labelledby="cartTitle">
        <div class="offcanvas-header bg-brand text-white">
          <h5 class="offcanvas-title" id="cartTitle"><i class="bi bi-bag me-2"></i>Your cart</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body d-flex flex-column">
          <div id="cartItems" class="flex-grow-1"></div>
          <div class="border-top pt-3">
            <div class="d-flex justify-content-between fw-bold fs-5"><span>Total</span><span id="cartTotal">₱0</span></div>
            <button type="button" id="checkoutBtn" class="btn btn-brand w-100 mt-3">Checkout</button>
            <button type="button" id="clearCart" class="btn btn-outline-secondary w-100 mt-2 rounded-pill">Clear cart</button>
          </div>
        </div>
      </div>
      <div class="toast-container position-fixed bottom-0 start-0 p-3" id="toastBox"></div>
      <button type="button" id="toTop" aria-label="Back to top"><i class="bi bi-arrow-up"></i></button>`);

    $('#cartItems').addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const cart = loadCart();
      const item = cart.find(i => i.v === btn.dataset.v);
      if (!item) return;
      if (btn.dataset.action === 'inc') item.qty = Math.min(item.qty + 1, MAX_QTY);
      if (btn.dataset.action === 'dec') item.qty = Math.max(item.qty - 1, 1);
      saveCart(btn.dataset.action === 'remove' ? cart.filter(i => i !== item) : cart);
      renderCart();
    });

    $('#clearCart').addEventListener('click', () => {
      saveCart([]);
      renderCart();
    });

    $('#checkoutBtn').addEventListener('click', () => {
      if (!loadCart().length) { toast('Your cart is empty.', 'warning'); return; }
      saveCart([]);
      renderCart();
      bootstrap.Offcanvas.getOrCreateInstance('#cartCanvas').hide();
      toast('Order placed! This is a demo, so no payment was taken.');
    });

    const toTop = $('#toTop');
    window.addEventListener('scroll', () => toTop.classList.toggle('show', window.scrollY > 320), { passive: true });
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }


  function initSearch() {
    $$('.js-search').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const q = form.querySelector('input').value.trim().toLowerCase();
        if (!q) { toast('Type something to search.', 'warning'); return; }
        if (/laptop|zenith|vortex|gaming|g15|rtx|notebook/.test(q)) {
          window.location.href = 'product.html';
        } else {
          toast(`No results for "${q}". Try "laptop".`, 'warning');
        }
      });
    });
  }


  function initMisc() {
    $$('[data-soon]').forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      toast(`${a.dataset.soon} is coming soon.`, 'secondary');
    }));

    $$('[data-quick-add]').forEach(b => b.addEventListener('click', () => addToCart('16', 1)));

    $$('.js-subscribe').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const input = form.querySelector('input');
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
        input.classList.toggle('is-invalid', !ok);
        if (!ok) { toast('Enter a valid email address.', 'danger'); return; }
        toast('Thanks for subscribing!');
        form.reset();
      });
    });
  }


  function initCountdown() {
    if (!$('#cdD')) return;
    const end = new Date();
    end.setDate(end.getDate() + ((7 - end.getDay()) % 7));
    end.setHours(23, 59, 59, 999);

    const tick = () => {
      let diff = Math.max(0, end - new Date());
      const d = Math.floor(diff / 864e5); diff -= d * 864e5;
      const h = Math.floor(diff / 36e5);  diff -= h * 36e5;
      const m = Math.floor(diff / 6e4);   diff -= m * 6e4;
      const s = Math.floor(diff / 1e3);
      $('#cdD').textContent = pad(d);
      $('#cdH').textContent = pad(h);
      $('#cdM').textContent = pad(m);
      $('#cdS').textContent = pad(s);
    };
    tick();
    setInterval(tick, 1000);
  }


  function initProductPage() {
    if (!$('#productPage')) return;

    let selected = '16';
    let qty = 1;


    const main = $('#mainImg');
    $$('.thumb').forEach(t => t.addEventListener('click', () => {
      $$('.thumb').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      main.src = t.dataset.src;
      main.alt = t.dataset.alt;
    }));


    function updatePrice() {
      const v = VARIANTS[selected];
      const save = v.old - v.price;
      $('#priceNow').textContent = peso(v.price);
      $('#priceOld').textContent = peso(v.old);
      $('#priceSave').textContent = `You save ${peso(save)}`;
      $('#discountBadge').textContent = `-${Math.round(save / v.old * 100)}%`;
      $('#installment').textContent = `${peso(Math.round(v.price / 12))}/month for 12 months at 0% interest`;
      $('#variantLabel').textContent = v.label;
      $$('.variant-btn').forEach(b => {
        const on = b.dataset.v === selected;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on);
      });
    }
    $$('.variant-btn').forEach(b => b.addEventListener('click', () => {
      selected = b.dataset.v;
      updatePrice();
    }));

    const qtyInput = $('#qtyInput');
    const setQty = n => {
      qty = Math.min(MAX_QTY, Math.max(1, parseInt(n, 10) || 1));
      qtyInput.value = qty;
    };
    $('#qtyMinus').addEventListener('click', () => setQty(qty - 1));
    $('#qtyPlus').addEventListener('click', () => setQty(qty + 1));
    qtyInput.addEventListener('change', () => setQty(qtyInput.value));

 
    $('#addToCart').addEventListener('click', () => addToCart(selected, qty));
    $('#buyNow').addEventListener('click', () => {
      addToCart(selected, qty);
      bootstrap.Offcanvas.getOrCreateInstance('#cartCanvas').show();
    });

    const wish = $('#wishBtn');
    wish.addEventListener('click', () => {
      const on = wish.querySelector('i').classList.toggle('bi-heart-fill');
      wish.querySelector('i').classList.toggle('bi-heart', !on);
      wish.setAttribute('aria-pressed', on);
      toast(on ? 'Saved to your wishlist.' : 'Removed from your wishlist.', on ? 'success' : 'secondary');
    });


    $$('.choose-plan').forEach(b => b.addEventListener('click', () => {
      selected = b.dataset.v;
      updatePrice();
      addToCart(selected, 1);
    }));

    updatePrice();
  }


  function initContactForm() {
    const form = $('#inquiryForm');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      form.classList.add('was-validated');
      if (!form.checkValidity()) {
        toast('Please fix the highlighted fields.', 'danger');
        return;
      }
      const data = new FormData(form);
      const result = $('#formResult');
      result.innerHTML = `<div class="alert alert-success mt-3" role="alert">
          <strong>Thank you, ${esc(data.get('name'))}!</strong>
          We received your request for <strong>${esc(data.get('qty'))} × ${esc(data.get('model'))}</strong>.
          A TechNest advisor will contact you at ${esc(data.get('email'))} within 24 hours.
        </div>`;
      form.reset();
      form.classList.remove('was-validated');
      result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    buildSharedUI();
    renderCart();
    initSearch();
    initMisc();
    initCountdown();
    initProductPage();
    initContactForm();
  });
})();
