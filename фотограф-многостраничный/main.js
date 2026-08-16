/* Аналитика */
(function () {
  var C = window.SITE || {};
  if (C.YM_ID) { (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym"); ym(C.YM_ID, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true }); }
  if (C.GA_ID) { var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + C.GA_ID; document.head.appendChild(s); window.dataLayer = window.dataLayer || []; window.gtag = function(){ dataLayer.push(arguments); }; gtag('js', new Date()); gtag('config', C.GA_ID); }
})();

/* Config */
(function () {
  var C = window.SITE || {};
  C.footerCopy = (C.footerLine || '© 2026') + ' · ' + (C.studio || '');
  document.querySelectorAll('[data-bind]').forEach(function (el) { var k = el.getAttribute('data-bind'); if (C[k] != null && C[k] !== '') el.textContent = C[k]; });
  if (C.phoneRaw) document.querySelectorAll('[data-tel]').forEach(function (el) { el.href = 'tel:' + C.phoneRaw; });
  if (C.email) document.querySelectorAll('[data-mail]').forEach(function (el) { el.href = 'mailto:' + C.email; });
  document.querySelectorAll('[data-social]').forEach(function (el) { var k = el.getAttribute('data-social'); if (C[k]) el.href = C[k]; });
  if (C.photo) { var box = document.querySelector('[data-photo]'); if (box) { box.innerHTML = ''; var img = document.createElement('img'); img.src = C.photo; img.alt = C.name || 'Фото'; img.className = 'about__img'; box.appendChild(img); } }
  var base = (document.title.split('—')[1] || '').trim();
  if (C.studio) document.title = C.studio + (base ? ' — ' + base : '');
})();

/* Мобильное меню */
(function () { var b = document.getElementById('burger'), m = document.getElementById('mobile-menu'); if (!b || !m) return; b.addEventListener('click', function () { m.classList.toggle('is-open'); }); m.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { m.classList.remove('is-open'); }); }); })();

/* Живой фон — боке */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var layer = document.createElement('div'); layer.className = 'bokeh-layer';
  var n = window.innerWidth < 700 ? 12 : 22;
  for (var i = 0; i < n; i++) {
    var b = document.createElement('span'); b.className = 'bokeh-dot';
    var s = Math.random() * 60 + 30;
    b.style.width = b.style.height = s + 'px';
    b.style.left = (Math.random() * 100) + 'vw';
    b.style.top = (Math.random() * 100) + 'vh';
    b.style.animationDuration = (Math.random() * 10 + 12) + 's';
    b.style.animationDelay = (-Math.random() * 12) + 's';
    layer.appendChild(b);
  }
  document.body.appendChild(layer);
})();

/* Минимальная дата = сегодня */
(function () { var d = document.getElementById('lead-date'); if (!d) return; var t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset()); d.min = t.toISOString().slice(0, 10); })();

/* 3D — ретро-камера, свободное вращение */
(function () {
  var canvas = document.getElementById('camera3d'); if (!canvas || typeof THREE === 'undefined') return;
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100); camera.position.set(0, 0.2, 9);
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
  function resize() { var w = canvas.clientWidth || 400, h = canvas.clientHeight || 400; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }

  // окружение — тёплое студийное
  (function () {
    var c = document.createElement('canvas'); c.width = 64; c.height = 256; var g = c.getContext('2d');
    var gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#fff5e0'); gr.addColorStop(0.15, '#f6e1b8'); gr.addColorStop(0.5, '#8c7148'); gr.addColorStop(1, '#161014');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.fillRect(0, 32, 64, 14);
    var t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping;
    if ('colorSpace' in t) t.colorSpace = THREE.SRGBColorSpace;
    scene.environment = t;
  })();
  scene.add(new THREE.HemisphereLight(0xfff2d5, 0x1a1414, 0.7));
  var key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(4, 7, 6); scene.add(key);
  var rim = new THREE.DirectionalLight(0xffdba5, 0.8); rim.position.set(-5, 2, -3); scene.add(rim);

  var cam = new THREE.Group(); scene.add(cam);

  // --- материалы ---
  var leather = new THREE.MeshPhysicalMaterial({ color: 0x1a1613, roughness: 0.82, metalness: 0.02, envMapIntensity: 0.6 });
  var brass = new THREE.MeshPhysicalMaterial({ color: 0xd4b48c, metalness: 1.0, roughness: 0.18, clearcoat: 0.6, envMapIntensity: 1.8 });
  var brassDeep = new THREE.MeshPhysicalMaterial({ color: 0x8c7148, metalness: 1.0, roughness: 0.4, envMapIntensity: 1.3 });
  var darkMetal = new THREE.MeshPhysicalMaterial({ color: 0x2a2622, metalness: 0.85, roughness: 0.35, envMapIntensity: 1.1 });
  var glass = new THREE.MeshPhysicalMaterial({ color: 0x0a0d12, roughness: 0.03, metalness: 0.1, transmission: 0.05, ior: 1.55, envMapIntensity: 2.4, clearcoat: 1.0, clearcoatRoughness: 0.02 });

  // --- корпус ЕДИНЫЙ (без швов): скруглённый прямоугольник с большими фасками ---
  function roundedBox(w, h, d, r, bev) {
    var s = new THREE.Shape(), x = -w/2, y = -h/2;
    s.moveTo(x+r, y);
    s.lineTo(x+w-r, y); s.quadraticCurveTo(x+w, y, x+w, y+r);
    s.lineTo(x+w, y+h-r); s.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    s.lineTo(x+r, y+h); s.quadraticCurveTo(x, y+h, x, y+h-r);
    s.lineTo(x, y+r); s.quadraticCurveTo(x, y, x+r, y);
    var g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 5, curveSegments: 24 });
    g.center(); return g;
  }

  // корпус — единый в коже, толще фаска для «мягкости»
  var body = new THREE.Mesh(roundedBox(3.6, 2.0, 1.05, 0.14, 0.14), leather); cam.add(body);

  // латунная верхняя пластина — тонкая, интегрирована с корпусом (по ширине УЖЕ на 0.1)
  var top = new THREE.Mesh(roundedBox(3.42, 0.22, 1.06, 0.08, 0.06), brass);
  top.position.y = 1.02; cam.add(top);

  // латунная нижняя пластина (базой)
  var bottom = new THREE.Mesh(roundedBox(3.42, 0.16, 1.06, 0.06, 0.05), brassDeep);
  bottom.position.y = -1.03; cam.add(bottom);

  // --- ВИДОИСКАТЕЛЬ (горб слева) с окошком-стеклом ---
  var vf = new THREE.Mesh(roundedBox(0.8, 0.34, 0.5, 0.07, 0.05), brass);
  vf.position.set(-1.0, 1.28, 0); cam.add(vf);
  var vfWindow = new THREE.Mesh(new THREE.CircleGeometry(0.11, 32), glass);
  vfWindow.position.set(-1.0, 1.28, 0.53); cam.add(vfWindow);
  // маленький верхний диод
  var vfDot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 16), new THREE.MeshBasicMaterial({ color: 0xff4a3a }));
  vfDot.position.set(-1.3, 1.35, 0.3); cam.add(vfDot);

  // --- КНОПКА СПУСКА с ободком ---
  var shutterBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 40), brassDeep);
  shutterBase.position.set(1.15, 1.16, 0.28); cam.add(shutterBase);
  var shutter = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.09, 40), brass);
  shutter.position.set(1.15, 1.22, 0.28); cam.add(shutter);

  // --- КОЛЁСИКИ (выдержка/ISO) с рельефом сверху ---
  function dial(x, y, z, r, h) {
    var d = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 44), brass);
    d.position.set(x, y, z); cam.add(d);
    // рифление сверху (маленькие сегменты)
    for (var i = 0; i < 20; i++) {
      var seg = new THREE.Mesh(new THREE.BoxGeometry(0.02, h+0.01, r*0.16), brassDeep);
      seg.position.set(x + Math.cos(i/20*Math.PI*2)*r*0.92, y, z + Math.sin(i/20*Math.PI*2)*r*0.92);
      seg.rotation.y = i/20*Math.PI*2; cam.add(seg);
    }
    var cap = new THREE.Mesh(new THREE.CylinderGeometry(r*0.8, r*0.8, 0.01, 40), brass);
    cap.position.set(x, y + h/2, z); cam.add(cap);
    return d;
  }
  dial(1.42, 1.22, -0.2, 0.24, 0.18);
  dial(-1.42, 1.22, -0.2, 0.20, 0.16);

  // --- ОБЪЕКТИВ (многоступенчатый, длиннее, с деталями) ---
  var lens = new THREE.Group(); lens.position.z = 0.9; cam.add(lens);

  // основание объектива (крепление байонет)
  var mount = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.72, 0.12, 48), brassDeep);
  mount.rotation.x = Math.PI/2; mount.position.z = -0.05; lens.add(mount);
  // средняя часть в коже (с рифлением-fokus ring)
  var barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.5, 48), leather);
  barrel.rotation.x = Math.PI/2; barrel.position.z = 0.25; lens.add(barrel);
  // рифление на кольце фокусировки (маленькие сегменты по окружности)
  for (var j = 0; j < 40; j++) {
    var t = j/40*Math.PI*2;
    var rib = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.4, 0.02), darkMetal);
    rib.position.set(Math.cos(t)*0.67, Math.sin(t)*0.67, 0.25); rib.rotation.z = t;
    lens.add(rib);
  }
  // латунное кольцо между секциями (шкала расстояний)
  var scale = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.68, 0.08, 48), brass);
  scale.rotation.x = Math.PI/2; scale.position.z = 0.55; lens.add(scale);
  // передняя секция (шире)
  var front = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.72, 0.28, 48), leather);
  front.rotation.x = Math.PI/2; front.position.z = 0.75; lens.add(front);
  // передняя оправа (латунь)
  var frontRing = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.78, 0.14, 48), brass);
  frontRing.rotation.x = Math.PI/2; frontRing.position.z = 0.96; lens.add(frontRing);
  // ВНУТРЕННЯЯ ВОРОНКА (тёмная — придаёт глубину линзе)
  var funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.5, 0.15, 48, 1, true), darkMetal);
  funnel.rotation.x = Math.PI/2; funnel.position.z = 1.02; funnel.material.side = THREE.DoubleSide; lens.add(funnel);
  // стекло-линза (тёмный глянец)
  var lensGlass = new THREE.Mesh(new THREE.CircleGeometry(0.62, 48), glass);
  lensGlass.position.z = 1.08; lens.add(lensGlass);
  // тонкое кольцо-блик по краю линзы
  var lensEdge = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.015, 12, 48), brass);
  lensEdge.position.z = 1.09; lens.add(lensEdge);
  // отражение-«зайчик» в стекле (крошечная светлая дуга)
  var flare = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.008, 8, 32, Math.PI*0.7), new THREE.MeshBasicMaterial({ color: 0xfff4d5, transparent: true, opacity: 0.5 }));
  flare.position.set(-0.15, 0.15, 1.1); flare.rotation.z = -0.8; lens.add(flare);

  // --- ЛОГОТИП-ТОЧКА на корпусе (латунный кружок) ---
  var badge = new THREE.Mesh(new THREE.CircleGeometry(0.14, 32), brass);
  badge.position.set(-1.35, 0.1, 0.53); cam.add(badge);
  var badgeInner = new THREE.Mesh(new THREE.CircleGeometry(0.07, 32), brassDeep);
  badgeInner.position.set(-1.35, 0.1, 0.531); cam.add(badgeInner);

  // --- ОТВЕРСТИЯ ДЛЯ РЕМЕШКА по бокам (интегрированные, а не плашка) ---
  function strapEye(x) {
    var eye = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.03, 12, 24), brass);
    eye.rotation.y = Math.PI/2; eye.position.set(x, 0.55, 0); cam.add(eye);
    var inner = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.12, 24), darkMetal);
    inner.rotation.z = Math.PI/2; inner.position.set(x, 0.55, 0); cam.add(inner);
  }
  strapEye(-1.83); strapEye(1.83);

  // мелкие винтики (детализация — 4 штуки в углах)
  [[-1.65, -0.85, 0.53], [1.65, -0.85, 0.53], [-1.65, 0.85, -0.53], [1.65, 0.85, -0.53]].forEach(function (p) {
    var scr = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16), brassDeep);
    scr.rotation.x = Math.PI/2; scr.position.set(p[0], p[1], p[2]); cam.add(scr);
  });

  cam.position.y = -0.35;

  // --- свободное вращение (трекбол по осям экрана) ---
  var dragging = false, px = 0, py = 0, vx = 0, vy = 0;
  canvas.style.cursor = 'grab';
  var _x = new THREE.Vector3(), _y = new THREE.Vector3(), _q = new THREE.Quaternion();
  function rotateScreen(ax, ay) {
    camera.matrixWorld.extractBasis(_x, _y, new THREE.Vector3());
    _q.setFromAxisAngle(_x, ax); cam.quaternion.premultiply(_q);
    _q.setFromAxisAngle(_y, ay); cam.quaternion.premultiply(_q);
  }
  canvas.addEventListener('pointerdown', function (e) { dragging = true; px = e.clientX; py = e.clientY; vx = vy = 0; canvas.style.cursor = 'grabbing'; canvas.setPointerCapture(e.pointerId); });
  window.addEventListener('pointerup', function () { dragging = false; canvas.style.cursor = 'grab'; });
  window.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY;
    var ax = dy * 0.008, ay = dx * 0.008;
    rotateScreen(ax, ay); vx = ay; vy = ax;
  });

  var clock = new THREE.Clock();
  function tick() {
    if (!dragging) {
      vx *= 0.95; vy *= 0.95;
      var idle = (Math.abs(vx) + Math.abs(vy) < 0.0005) ? 0.002 : 0;
      rotateScreen(vy, vx + idle);
    }
    cam.position.y = -0.4 + Math.sin(clock.getElapsedTime() * 0.7) * 0.05;
    renderer.render(scene, camera); requestAnimationFrame(tick);
  }
  resize(); window.addEventListener('resize', resize); setTimeout(resize, 200); tick();
})();

/* Галерея-фильтр + до/после */
(function () {
  var tabs = document.querySelectorAll('.gallery-tab');
  var items = document.querySelectorAll('.gallery [data-cat]');
  if (!tabs.length) return;
  var styles = {
    wedding:['#4a3835','#d4b48c','Свадебная'], portrait:['#3f3a35','#8c7148','Портрет'],
    product:['#2a2d33','#b8a888','Предметная'], studio:['#38302a','#c9a878','Студийная'],
    all:['#46403a','#d4b48c','Все категории']
  };
  function applyBA(cat) {
    var bef = document.querySelector('.ba-before'), aft = document.querySelector('.ba-after'), lbl = document.getElementById('ba-name');
    if (!bef || !aft) return;
    var s = styles[cat] || styles.all;
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

/* До/после — слайдер */
(function () {
  var slider = document.querySelector('.ba-slider'); if (!slider) return;
  var after = slider.querySelector('.ba-after'), handle = slider.querySelector('.ba-handle');
  var dragging = false;
  function setPos(cx) { var r = slider.getBoundingClientRect(); var p = Math.max(0, Math.min(1, (cx - r.left) / r.width)); after.style.clipPath = 'inset(0 0 0 ' + (p * 100) + '%)'; handle.style.left = (p * 100) + '%'; }
  slider.addEventListener('pointerdown', function (e) { dragging = true; slider.setPointerCapture(e.pointerId); setPos(e.clientX); });
  slider.addEventListener('pointermove', function (e) { if (dragging) setPos(e.clientX); });
  slider.addEventListener('pointerup', function () { dragging = false; });
})();

/* Тост + форма */
function showToast(m) { var t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t); requestAnimationFrame(function(){ t.classList.add('is-show'); }); setTimeout(function(){ t.classList.remove('is-show'); setTimeout(function(){ t.remove(); },400); },4000); }
(function () {
  var f = document.getElementById('lead-form'); if (!f) return;
  var th = document.getElementById('lead-thanks');
  f.addEventListener('submit', function (e) { e.preventDefault(); if (!f.checkValidity()) { f.reportValidity(); return; } f.querySelectorAll('input,select,textarea,button').forEach(function(el){ el.disabled = true; }); if (th) th.hidden = false; showToast('✓ Заявка отправлена'); });
})();

/* Появление при скролле */
(function () { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.style.opacity = 1; e.target.style.transform = 'none'; io.unobserve(e.target); } }); }, { threshold: 0.12 }); document.querySelectorAll('.card, .shot, .review').forEach(function (el, i) { el.style.opacity = 0; el.style.transform = 'translateY(20px)'; el.style.transition = 'opacity .5s ' + (i * 55) + 'ms ease, transform .5s ' + (i * 55) + 'ms ease'; io.observe(el); }); })();
