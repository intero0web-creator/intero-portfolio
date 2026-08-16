/* =========================================================
   Аналитика — подключается только если ID указан в config.js
   ========================================================= */
(function () {
  var C = window.SITE || {};
  if (C.YM_ID) {
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);})
    (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
    ym(C.YM_ID, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true });
  }
  if (C.GA_ID) {
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + C.GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag('js', new Date()); gtag('config', C.GA_ID);
  }
})();

/* =========================================================
   Данные из config.js
   ========================================================= */
(function () {
  var C = window.SITE || {};
  C.footerCopy = (C.footerLine || '© 2026') + ' · ' + (C.studio || '');
  document.querySelectorAll('[data-bind]').forEach(function (el) {
    var k = el.getAttribute('data-bind');
    if (C[k] != null && C[k] !== '') el.textContent = C[k];
  });
  if (C.phoneRaw) document.querySelectorAll('[data-tel]').forEach(function (el) { el.href = 'tel:' + C.phoneRaw; });
  if (C.email) document.querySelectorAll('[data-mail]').forEach(function (el) { el.href = 'mailto:' + C.email; });
  document.querySelectorAll('[data-social]').forEach(function (el) {
    var k = el.getAttribute('data-social'); if (C[k]) el.href = C[k];
  });
  if (C.photo) {
    var box = document.querySelector('[data-photo]');
    if (box) { box.innerHTML = ''; var img = document.createElement('img'); img.src = C.photo; img.alt = C.name || 'Фото мастера'; img.className = 'about__img'; box.appendChild(img); }
  }
  var base = (document.title.split('—')[1] || '').trim();
  if (C.studio) document.title = C.studio + (base ? ' — ' + base : '');
})();

/* =========================================================
   Мобильное меню
   ========================================================= */
(function () {
  var b = document.getElementById('burger'), m = document.getElementById('mobile-menu');
  if (!b || !m) return;
  b.addEventListener('click', function () { m.classList.toggle('is-open'); });
  m.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { m.classList.remove('is-open'); }); });
})();

/* =========================================================
   Рамка-сухоцветы (силуэт + акварель) + лепестки + боке.
   Вставляются на все страницы автоматически.
   ========================================================= */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- рамка-сухоцветы: плотно по краям, полная высота боков + верх ---
  var frame = document.createElement('div');
  frame.className = 'vine-frame'; frame.setAttribute('aria-hidden', 'true');
  frame.innerHTML =
    '<div class="vine-edge vine-left"></div>' +
    '<div class="vine-edge vine-right"></div>' +
    '<div class="vine-edge vine-top"></div>';
  document.body.appendChild(frame);

  if (reduce) return;

  // --- лепестки + боке ---
  var layer = document.createElement('div');
  layer.className = 'petal-layer'; layer.setAttribute('aria-hidden', 'true');
  var petalSvg = '<svg viewBox="0 0 20 24"><path d="M10 0 C2 6 0 16 10 24 C20 16 18 6 10 0 Z"/></svg>';
  var nP = window.innerWidth < 700 ? 10 : 18;
  for (var i = 0; i < nP; i++) {
    var p = document.createElement('span'); p.className = 'petal';
    var s = Math.random() * 10 + 10;
    p.style.width = s + 'px'; p.style.height = (s * 1.2) + 'px';
    p.style.left = (Math.random() * 100) + 'vw';
    p.style.animationDuration = (Math.random() * 8 + 9) + 's';
    p.style.animationDelay = (-Math.random() * 16) + 's';
    p.style.setProperty('--sway', (Math.random() * 60 + 30) + 'px');
    p.innerHTML = petalSvg;
    layer.appendChild(p);
  }
  var nB = window.innerWidth < 700 ? 8 : 14;
  for (var j = 0; j < nB; j++) {
    var b = document.createElement('span'); b.className = 'bokeh';
    var bs = Math.random() * 40 + 20;
    b.style.width = b.style.height = bs + 'px';
    b.style.left = (Math.random() * 100) + 'vw';
    b.style.top = (Math.random() * 100) + 'vh';
    b.style.animationDuration = (Math.random() * 10 + 12) + 's';
    b.style.animationDelay = (-Math.random() * 12) + 's';
    layer.appendChild(b);
  }
  document.body.appendChild(layer);
})();

/* =========================================================
   Витрина ногтей — реалистичная гель-палитра, готовые
   сочетания и стили покрытия.
   ========================================================= */
window.NAIL = (function () {
  var stage = document.getElementById('stage');
  if (!stage) return {};
  var ombreBottom = document.querySelector('.ombre-bottom');
  var nameOut = document.getElementById('shade-name');

  function setMain(color, name) {
    stage.style.setProperty('--nail', color);
    stage.style.setProperty('--accent-nail', color); // по умолчанию акцент = основной
    if (ombreBottom) ombreBottom.setAttribute('stop-color', color);
    if (nameOut && name) nameOut.textContent = name;
  }
  function setCombo(main, accent, label) {
    stage.style.setProperty('--nail', main);
    stage.style.setProperty('--accent-nail', accent);
    if (ombreBottom) ombreBottom.setAttribute('stop-color', main);
    if (nameOut && label) nameOut.textContent = label;
  }
  function setStyle(s) {
    ['solid', 'french', 'ombre', 'glitter', 'matte'].forEach(function (n) { stage.classList.remove('st-' + n); });
    stage.classList.add('st-' + s);
  }
  return { setMain: setMain, setCombo: setCombo, setStyle: setStyle };
})();

(function () {
  var stage = document.getElementById('stage'); if (!stage) return;
  var sw = document.getElementById('swatches');
  var pal = document.getElementById('palettes');
  var st = document.getElementById('styles');

  if (sw) sw.addEventListener('click', function (e) {
    var b = e.target.closest('.swatch'); if (!b) return;
    sw.querySelectorAll('.swatch').forEach(function (x) { x.classList.toggle('is-active', x === b); });
    if (pal) pal.querySelectorAll('.palette').forEach(function (x) { x.classList.remove('is-active'); });
    window.NAIL.setMain(b.dataset.color, b.getAttribute('aria-label'));
  });
  if (pal) pal.addEventListener('click', function (e) {
    var b = e.target.closest('.palette'); if (!b) return;
    pal.querySelectorAll('.palette').forEach(function (x) { x.classList.toggle('is-active', x === b); });
    if (sw) sw.querySelectorAll('.swatch').forEach(function (x) { x.classList.remove('is-active'); });
    window.NAIL.setCombo(b.dataset.main, b.dataset.accent, b.dataset.name);
  });
  if (st) st.addEventListener('click', function (e) {
    var b = e.target.closest('.style'); if (!b) return;
    st.querySelectorAll('.style').forEach(function (x) { x.classList.toggle('is-active', x === b); });
    window.NAIL.setStyle(b.dataset.style);
  });

  window.NAIL.setMain('#e7b7ad', 'Нюд-роза');
  window.NAIL.setStyle('solid');
})();

/* =========================================================
   3D-флакон лака: вращение перетаскиванием (ЛКМ), 360°.
   Цвет лака = выбранный оттенок витрины.
   ========================================================= */
(function () {
  var canvas = document.getElementById('flacon');
  if (!canvas || typeof THREE === 'undefined') return;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.2, 9);
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  function resize() { var w = canvas.clientWidth || 400, h = canvas.clientHeight || 400; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }

  // окружение — контрастная студия: яркая полоса сверху → тёмный низ,
  // чтобы стекло и крышка давали чёткие блики (иначе выглядит «дёшево/пластиково»)
  (function () {
    var c = document.createElement('canvas'); c.width = 64; c.height = 256; var g = c.getContext('2d');
    var gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0.00, '#ffffff'); gr.addColorStop(0.16, '#ffffff');
    gr.addColorStop(0.22, '#f4e8ef'); gr.addColorStop(0.50, '#c9bccb');
    gr.addColorStop(0.74, '#6c6474'); gr.addColorStop(1.00, '#211d28');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
    // яркий световой «софтбокс»
    g.fillStyle = 'rgba(255,255,255,0.95)'; g.fillRect(0, 40, 64, 16);
    var t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping;
    if ('colorSpace' in t) t.colorSpace = THREE.SRGBColorSpace;
    scene.environment = t;
  })();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe8d5df, 0.7));
  var key = new THREE.DirectionalLight(0xffffff, 1.8); key.position.set(4, 8, 6); scene.add(key);
  var rim = new THREE.DirectionalLight(0xffe4ef, 0.9); rim.position.set(-6, 2, -4); scene.add(rim);

  var flacon = new THREE.Group(); scene.add(flacon);

  // --- КОРПУС: квадратный флакон (OPI-style) через скруглённый профиль + фаски ---
  function roundedRect(w, h, r) {
    var s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  var glassGeo = new THREE.ExtrudeGeometry(roundedRect(1.7, 2.3, 0.42),
    { depth: 0.95, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.14, bevelSegments: 4, curveSegments: 24 });
  glassGeo.center();
  var lacquer = new THREE.MeshPhysicalMaterial({ color: 0xe7b7ad, metalness: 0.0, roughness: 0.05, clearcoat: 1.0, clearcoatRoughness: 0.04, envMapIntensity: 2.4, transmission: 0.12, thickness: 1.6, ior: 1.5 });
  window.__lacquer = lacquer;
  var body = new THREE.Mesh(glassGeo, lacquer); flacon.add(body);

  // горлышко (матовое стекло)
  var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.28, 40),
    new THREE.MeshStandardMaterial({ color: 0xead7cd, roughness: 0.4, metalness: 0.1, envMapIntensity: 1.2 }));
  neck.position.y = 1.28; flacon.add(neck);

  // --- КРЫШКА: гладкая тёмно-глянцевая (как у брендовых лаков) ---
  var capMat = new THREE.MeshPhysicalMaterial({ color: 0x2b2732, metalness: 0.1, roughness: 0.12, clearcoat: 1.0, clearcoatRoughness: 0.05, envMapIntensity: 2.6 });
  var capProf = [[0.0,1.35],[0.5,1.35],[0.52,1.5],[0.52,2.56],[0.49,2.72],[0.36,2.85],[0.16,2.92],[0.0,2.94]]
    .map(function(p){ return new THREE.Vector2(p[0], p[1]); });
  var cap = new THREE.Mesh(new THREE.LatheGeometry(capProf, 64), capMat); flacon.add(cap);

  flacon.position.y = -0.55;
  flacon.rotation.set(0.1, -0.5, 0);

  // --- истинно свободное вращение (трекбол по осям камеры) ---
  var dragging = false, px = 0, py = 0;
  var angVx = 0, angVy = 0;                 // угловая скорость (для инерции)
  canvas.style.cursor = 'grab';

  // вращение вокруг осей X и Y КАМЕРЫ (экрана) — независимо от того, как повёрнут флакон
  var _xAxis = new THREE.Vector3(), _yAxis = new THREE.Vector3(), _q = new THREE.Quaternion();
  function rotateScreen(angleX, angleY) {
    camera.matrixWorld.extractBasis(_xAxis, _yAxis, new THREE.Vector3());
    _q.setFromAxisAngle(_xAxis, angleX); flacon.quaternion.premultiply(_q);
    _q.setFromAxisAngle(_yAxis, angleY); flacon.quaternion.premultiply(_q);
  }

  canvas.addEventListener('pointerdown', function (e) {
    dragging = true; px = e.clientX; py = e.clientY;
    angVx = angVy = 0;                      // сброс инерции
    canvas.style.cursor = 'grabbing'; canvas.setPointerCapture(e.pointerId);
  });
  window.addEventListener('pointerup', function () { dragging = false; canvas.style.cursor = 'grab'; });
  window.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY;
    var ax = dy * 0.01, ay = dx * 0.01;
    rotateScreen(ax, ay);
    angVx = ax; angVy = ay;                 // запоминаем последнюю скорость
  });

  var clock = new THREE.Clock();
  function tick() {
    if (!dragging) {
      angVx *= 0.94; angVy *= 0.94;
      // лёгкое авто-вращение только когда инерция уже почти нулевая
      var idle = (Math.abs(angVx) + Math.abs(angVy) < 0.0005) ? 0.003 : 0;
      rotateScreen(angVx, angVy + idle);
    }
    flacon.position.y = -0.55 + Math.sin(clock.getElapsedTime() * 0.8) * 0.05;
    renderer.render(scene, camera); requestAnimationFrame(tick);
  }
  resize(); window.addEventListener('resize', resize); setTimeout(resize, 200); tick();

  // синхронизация цвета флакона с витриной (если она на этой странице)
  var stage = document.getElementById('stage');
  if (stage) {
    var sync = function () { var col = getComputedStyle(stage).getPropertyValue('--nail').trim(); if (col) lacquer.color.set(col); };
    var mo = new MutationObserver(sync); mo.observe(stage, { attributes: true, attributeFilter: ['style', 'class'] });
    setTimeout(sync, 300);
  }
})();

/* =========================================================
   Форма записи + тост
   ========================================================= */
function showToast(msg) {
  var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(function () { t.classList.add('is-show'); });
  setTimeout(function () { t.classList.remove('is-show'); setTimeout(function () { t.remove(); }, 400); }, 4000);
}
(function () {
  var form = document.getElementById('lead-form'); if (!form) return;
  var thanks = document.getElementById('lead-thanks');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    form.querySelectorAll('input, select, button').forEach(function (el) { el.disabled = true; });
    if (thanks) thanks.hidden = false;
    showToast('✓ Заявка отправлена! Напишу вам в течение дня');
  });
})();

/* =========================================================
   Минимальная дата формы = сегодня (нельзя выбрать прошлое)
   ========================================================= */
(function () {
  var d = document.getElementById('lead-date'); if (!d) return;
  var t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
  d.min = t.toISOString().slice(0, 10);
})();

/* =========================================================
   Галерея с фильтром по категориям (+ синхронизация с до/после)
   ========================================================= */
(function () {
  var tabs = document.querySelectorAll('.gallery-tab');
  var items = document.querySelectorAll('.gallery [data-cat]');
  if (!tabs.length) return;
  var styles = { minimal:['#f3e6de','#e7b7ad','Минимализм · нюд'], french:['#f8f0e6','#c9a08c','Френч · классика'],
    ombre:['#fbeef4','#cf6f8e','Омбре · розовое'], art:['#e7d9f5','#8b5ba5','Дизайн · арт'],
    wedding:['#fdf6f0','#d4b895','Свадебное · нюд+блеск'], season:['#f4e5d0','#b06a3c','Сезонное · терракот'],
    all:['#f6d0da','#cf6f8e','Все стили'] };
  function applyBA(cat) {
    var bef = document.querySelector('.ba-before'), aft = document.querySelector('.ba-after'), lbl = document.getElementById('ba-name');
    if (!bef || !aft) return;
    var s = styles[cat] || styles.all;
    bef.style.background = 'linear-gradient(160deg,#c9b4a7,#9a7f70)';
    aft.style.background = 'linear-gradient(160deg,' + s[0] + ',' + s[1] + ')';
    if (lbl) lbl.textContent = s[2];
  }
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var cat = tab.dataset.filter;
      tabs.forEach(function (t) { t.classList.toggle('is-active', t === tab); });
      items.forEach(function (it) { it.classList.toggle('is-hidden', cat !== 'all' && it.dataset.cat !== cat); });
      applyBA(cat);
    });
  });
})();

/* =========================================================
   Слайдер «до/после»
   ========================================================= */
(function () {
  var slider = document.querySelector('.ba-slider'); if (!slider) return;
  var after = slider.querySelector('.ba-after');
  var handle = slider.querySelector('.ba-handle');
  var dragging = false;
  function setPos(clientX) {
    var r = slider.getBoundingClientRect();
    var p = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    after.style.clipPath = 'inset(0 0 0 ' + (p * 100) + '%)';
    handle.style.left = (p * 100) + '%';
  }
  slider.addEventListener('pointerdown', function (e) { dragging = true; slider.setPointerCapture(e.pointerId); setPos(e.clientX); });
  slider.addEventListener('pointermove', function (e) { if (dragging) setPos(e.clientX); });
  slider.addEventListener('pointerup', function () { dragging = false; });
})();

/* =========================================================
   Появление при скролле
   ========================================================= */
(function () {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.style.opacity = 1; e.target.style.transform = 'none'; io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.svc, .shot, .review, .why-card').forEach(function (el, i) {
    el.style.opacity = 0; el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .5s ' + (i * 55) + 'ms ease, transform .5s ' + (i * 55) + 'ms ease';
    io.observe(el);
  });
})();
