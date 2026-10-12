/* ============================================================
   Romeri Romero — menú lateral y panel de contacto
   Para cambiar los enlaces del menú o los datos de contacto,
   edita solo las listas MENU y CONTACTO de aquí abajo.
   ============================================================ */
(function () {
  var MENU = [
    { label: 'Colecciones', href: 'index.html#coleccion', children: [
      { label: 'Polos', href: 'coleccion-polos.html' },
      { label: 'Deportivos', href: 'coleccion-deportivos.html' },
      { label: 'Maglione', href: 'coleccion-maglione.html' },
      { label: 'Camisetas', href: 'coleccion-camisetas.html' }
    ]},
    { label: 'Nuestra historia', href: 'historia.html' },
    { label: 'Contacto', contact: true }
  ];

  var CONTACTO = [
    { label: 'Instagram', href: 'https://instagram.com/romeriromero_', external: true },
    { label: 'TikTok', href: 'https://tiktok.com/@romeriromero_', external: true },
    { label: 'Número de contacto', href: 'https://wa.me/593990550832', external: true },
    { label: 'romeriromeroqualita@gmail.com', href: 'mailto:romeriromeroqualita@gmail.com' }
  ];

  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  function isCurrent(href) {
    return href.split('#')[0].toLowerCase() === page && href.indexOf('#') === -1;
  }

  /* ---------- construir el HTML ---------- */
  var menuHTML = '';
  MENU.forEach(function (item) {
    menuHTML += '<div class="menu-item">';
    if (item.contact) {
      menuHTML += '<button type="button" class="menu-link" data-open-contact>' + item.label + '</button>';
    } else {
      menuHTML += '<a class="menu-link" href="' + item.href + '"' +
        (isCurrent(item.href) ? ' aria-current="page"' : '') + '>' + item.label + '</a>';
    }
    if (item.children) {
      menuHTML += '<div class="menu-sub">';
      item.children.forEach(function (c) {
        menuHTML += '<a href="' + c.href + '"' + (isCurrent(c.href) ? ' aria-current="page"' : '') + '>' + c.label + '</a>';
      });
      menuHTML += '</div>';
    }
    menuHTML += '</div>';
  });

  var contactHTML = '';
  CONTACTO.forEach(function (c) {
    contactHTML += '<a class="contact-row" href="' + c.href + '"' +
      (c.external ? ' target="_blank" rel="noopener"' : '') + '>' + c.label + '</a>';
  });

  var wrap = document.createElement('div');
  wrap.innerHTML =
    '<div class="drawer-overlay" id="drawerOverlay"></div>' +
    '<aside class="drawer drawer-left" id="menuDrawer" role="dialog" aria-modal="true" aria-label="Menú" aria-hidden="true">' +
      '<button type="button" class="drawer-close" aria-label="Cerrar menú">&times;</button>' +
      '<div class="drawer-title">Menú</div>' +
      '<nav aria-label="Principal">' + menuHTML + '</nav>' +
    '</aside>' +
    '<aside class="drawer drawer-right" id="contactDrawer" role="dialog" aria-modal="true" aria-label="Contactos" aria-hidden="true">' +
      '<button type="button" class="drawer-close" aria-label="Cerrar contactos">&times;</button>' +
      '<div class="drawer-title">Contactos</div>' +
      contactHTML +
    '</aside>';
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

  /* ---------- comportamiento ---------- */
  var overlay = document.getElementById('drawerOverlay');
  var drawers = { menu: document.getElementById('menuDrawer'), contact: document.getElementById('contactDrawer') };
  var toggle = document.querySelector('.menu-toggle');
  var openKey = null;
  var lastFocus = null;

  function focusables(el) {
    return Array.prototype.slice.call(el.querySelectorAll('a[href],button:not([disabled])'));
  }

  function closeAll(restoreFocus) {
    if (!openKey) return;
    var d = drawers[openKey];
    d.classList.remove('active');
    d.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    openKey = null;
    if (restoreFocus && lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function open(key) {
    if (openKey === key) return;
    if (openKey) closeAll(false); else lastFocus = document.activeElement;
    var d = drawers[key];
    d.classList.add('active');
    d.setAttribute('aria-hidden', 'false');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (key === 'menu' && toggle) toggle.setAttribute('aria-expanded', 'true');
    openKey = key;
    var f = focusables(d);
    if (f.length) f[0].focus();
  }

  if (toggle) toggle.addEventListener('click', function () { open('menu'); });
  overlay.addEventListener('click', function () { closeAll(true); });

  Object.keys(drawers).forEach(function (k) {
    drawers[k].querySelector('.drawer-close').addEventListener('click', function () { closeAll(true); });
  });

  /* enlaces del menú: cerrar al tocarlos (sirve para anclas en la misma página) */
  drawers.menu.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (a) { closeAll(false); return; }
    var b = e.target.closest ? e.target.closest('[data-open-contact]') : null;
    if (b) { open('contact'); }
  });

  document.addEventListener('keydown', function (e) {
    if (!openKey) return;
    if (e.key === 'Escape') { closeAll(true); return; }
    if (e.key === 'Tab') {
      var f = focusables(drawers[openKey]);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* compatibilidad con el código anterior */
  window.openContact = function (e) { if (e) e.preventDefault(); open('contact'); };
  window.closeContact = function () { closeAll(true); };
})();
