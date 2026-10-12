/* ============================================================
   Romeri Romero — carrito de compras (guardado en el navegador)
   Necesita menu.js (panel lateral). Más adelante, "Pagar" se
   conecta al servidor; aquí solo vive la parte visual.
   ============================================================ */
(function () {
  var KEY = 'rr_cart_v1', MAX = 10, items = [], focusSel = null;
  var STYLE = { spaced: 'letras separadas', tight: 'letras juntas', num: 'números' };

  function load() { try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { items = []; } if (!Array.isArray(items)) items = []; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} }
  function money(n) { return '$' + n.toFixed(2); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function count() { return items.reduce(function (a, i) { return a + i.qty; }, 0); }
  function subtotal() { return items.reduce(function (a, i) { return a + i.qty * i.price; }, 0); }
  function keyOf(i) { return [i.name, i.size, i.color || '', i.initials ? i.initials.text + i.initials.color + i.initials.style : ''].join('|'); }
  function detail(i) {
    var d = ['Talla ' + i.size];
    if (i.color) d.push('Bordado ' + i.color.toLowerCase());
    if (i.initials) d.push('Iniciales ' + i.initials.text + ' (' + i.initials.color.toLowerCase() + ', ' + (STYLE[i.initials.style] || '') + ')');
    return d.join(' · ');
  }

  function waLink() {
    var t = 'Hola, quiero hacer este pedido y pagar por transferencia:\n\n';
    items.forEach(function (i, n) {
      t += (n + 1) + ') ' + i.name + '\n   ' + detail(i) + '\n   ' + i.qty + ' × ' + money(i.price) + ' = ' + money(i.qty * i.price) + '\n\n';
    });
    t += 'Subtotal: ' + money(subtotal()) + '\n(El envío se confirma según mi ciudad)\n\nMis datos:\nNombre:\nCiudad y dirección:';
    return 'https://wa.me/' + ((window.RR && window.RR.whatsapp) || '') + '?text=' + encodeURIComponent(t);
  }

  var badge = null;
  function render() {
    var n = count();
    if (badge) { badge.textContent = n; badge.hidden = !n; }
    var body = document.getElementById('cartBody'); if (!body) return;
    if (!items.length) {
      body.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p><a class="cart-link" href="index.html#coleccion">Ver colección</a>';
      return;
    }
    var h = '';
    items.forEach(function (i, idx) {
      h += '<div class="cart-line"><div class="cart-line-top"><span>' + esc(i.name) + '</span><span>' + money(i.qty * i.price) + '</span></div>' +
        '<div class="cart-detail">' + esc(detail(i)) + '<br>' + money(i.price) + ' c/u</div>' +
        '<div class="cart-line-bottom"><div class="cart-qty">' +
        '<button type="button" data-act="dec" data-i="' + idx + '" aria-label="Quitar una unidad">−</button><span>' + i.qty + '</span>' +
        '<button type="button" data-act="inc" data-i="' + idx + '" aria-label="Agregar una unidad">+</button></div>' +
        '<button type="button" class="cart-del" data-act="del" data-i="' + idx + '">Quitar</button></div></div>';
    });
    h += '<div class="cart-total"><span>Subtotal</span><b>' + money(subtotal()) + '</b></div>' +
      '<p class="cart-note">El envío se confirma según tu ciudad.</p>' +
      '<a class="cart-btn" href="' + waLink() + '" target="_blank" rel="noopener">Pedir por transferencia (WhatsApp)</a>' +
      '<span class="cart-btn ghost" aria-disabled="true">Pagar con tarjeta · Próximamente</span>';
    body.innerHTML = h;
    if (focusSel) { var f = body.querySelector(focusSel); if (f) f.focus(); focusSel = null; }
  }

  function add(item) {
    var k = keyOf(item), f = items.filter(function (i) { return keyOf(i) === k; })[0];
    if (f) f.qty = Math.min(MAX, f.qty + 1); else items.push(item);
    save(); render();
    if (window.RR) window.RR.open('cart');
  }

  window.RRCart = {
    addFromProduct: function (P, s, extra) {
      var cn = document.getElementById('colorName');
      var ini = s.initials ? { text: s.initials.text, color: ((P.initialColors || [])[s.initials.color] || {}).name || '', style: s.initials.style } : null;
      add({ name: P.name, price: P.price + (ini ? extra : 0), size: s.size, color: (P.variants && P.variants.length && cn) ? cn.textContent : '', initials: ini, qty: 1 });
    }
  };

  load();

  /* ícono de bolsa en la barra superior */
  var right = document.querySelector('.site-nav .nav-right');
  if (right) {
    right.innerHTML = '<button type="button" class="cart-toggle" aria-label="Abrir carrito">' +
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>' +
      '<span class="cart-count" hidden>0</span></button>';
    badge = right.querySelector('.cart-count');
    right.querySelector('.cart-toggle').addEventListener('click', function () { if (window.RR) window.RR.open('cart'); });
  }

  var body = document.getElementById('cartBody');
  if (body) body.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-act]') : null; if (!b) return;
    var i = +b.getAttribute('data-i'), act = b.getAttribute('data-act'), it = items[i]; if (!it) return;
    if (act === 'inc') it.qty = Math.min(MAX, it.qty + 1);
    if (act === 'dec') it.qty = Math.max(1, it.qty - 1);
    if (act === 'del') items.splice(i, 1);
    focusSel = act === 'del' ? null : '[data-act="' + act + '"][data-i="' + i + '"]';
    save(); render();
  });

  window.addEventListener('storage', function (e) { if (e.key === KEY) { load(); render(); } });

  /* botón de las páginas de producto */
  var buy = document.getElementById('buyBtn');
  if (buy && window.PRODUCT) {
    if (window.PRODUCT.price === null) { buy.disabled = true; buy.textContent = 'Próximamente'; }
    else buy.textContent = 'Agregar al carrito';
  }
  render();
})();
