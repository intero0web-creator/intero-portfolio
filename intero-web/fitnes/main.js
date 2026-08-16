/* =========================================================
   Аналитика — подключается только если ID указан в config.js
   ========================================================= */
(function () {
  var C = window.SITE || {};
  if (C.YM_ID) {
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);})
    (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
    ym(C.YM_ID, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true });
  }
  if (C.GA_ID) {
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + C.GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag('js', new Date()); gtag('config', C.GA_ID);
  }
  if (C.VK_PIXEL) {
    var t = document.createElement('script'); t.async = true;
    t.src = 'https://vk.com/js/api/openapi.js?169';
    t.onload = function () {
      if (window.VK) { VK.Retargeting.Init(C.VK_PIXEL); VK.Retargeting.Hit(); }
    };
    document.head.appendChild(t);
  }
})();

/* =========================================================
   Данные из config.js → в разметку
   ========================================================= */
(function () {
  var C = window.SITE || {};
  C.footerCopy = (C.footerLine || '© 2026') + ' · ' + (C.studio || '');
  document.querySelectorAll('[data-bind]').forEach(function (el) {
    var k = el.getAttribute('data-bind');
    if (C[k] != null && C[k] !== '') el.textContent = C[k];
  });
  if (C.phoneRaw) document.querySelectorAll('[data-tel]').forEach(function (el) { el.href = 'tel:' + C.phoneRaw; });
  if (C.email)    document.querySelectorAll('[data-mail]').forEach(function (el) { el.href = 'mailto:' + C.email; });
  document.querySelectorAll('[data-social]').forEach(function (el) {
    var k = el.getAttribute('data-social'); if (C[k]) el.href = C[k];
  });
  // Онлайн-запись: если задан bookingUrl — ведём туда (нов. вкладка), иначе на форму
  document.querySelectorAll('[data-book]').forEach(function (el) {
    if (C.bookingUrl) { el.href = C.bookingUrl; el.target = '_blank'; el.rel = 'noopener'; }
    else { el.href = 'kontakty.html#zapis'; }
  });
  // Карта
  var mapBox = document.querySelector('[data-map]');
  if (mapBox && C.mapEmbed) {
    mapBox.innerHTML = '<iframe src="' + C.mapEmbed + '" loading="lazy" title="Карта" allowfullscreen></iframe>';
  }
  document.querySelectorAll('[data-maplink]').forEach(function (el) { if (C.mapLink) el.href = C.mapLink; });
  // Фото тренера
  if (C.photo) {
    var box = document.querySelector('[data-photo]');
    if (box) { box.innerHTML = ''; var img = document.createElement('img'); img.src = C.photo; img.alt = C.name || 'Фото тренера'; box.appendChild(img); }
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
   Промо-полоса «Первое занятие — бесплатно» — на все страницы
   ========================================================= */
(function () {
  if (document.querySelector('.promo-bar')) return;
  var C = window.SITE || {};
  var href = C.bookingUrl ? C.bookingUrl : 'kontakty.html#zapis';
  var a = document.createElement('a');
  a.className = 'promo-bar'; a.href = href;
  if (C.bookingUrl) { a.target = '_blank'; a.rel = 'noopener'; }
  a.innerHTML = '<span class="promo-bar__pill">Акция</span>' +
    '<span>Первое занятие — <b>бесплатно</b>: диагностика и пробная тренировка без обязательств</span>' +
    '<span class="promo-bar__cta">Записаться →</span>';
  document.body.prepend(a);
})();

/* =========================================================
   Фоновые «дышащие» волны — на все страницы
   ========================================================= */
(function () {
  if (document.querySelector('.waves')) return;
  var w = document.createElement('div');
  w.className = 'waves'; w.setAttribute('aria-hidden', 'true');
  w.innerHTML = '<span class="w1"></span><span class="w2"></span><span class="w3"></span>';
  document.body.prepend(w);
})();

/* =========================================================
   Кнопка «Поделиться» — Web Share API + запасной вариант (копия ссылки)
   ========================================================= */
(function () {
  document.querySelectorAll('[data-share]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var data = { title: document.title, text: 'Смотри — ' + document.title, url: location.href };
      if (navigator.share) { navigator.share(data).catch(function () {}); }
      else if (navigator.clipboard) {
        navigator.clipboard.writeText(location.href).then(function () { showToast('🔗 Ссылка скопирована'); });
      } else { showToast('Скопируйте ссылку из адресной строки'); }
    });
  });
})();

/* =========================================================
   Share-кнопки WhatsApp / Telegram (статьи, программы и т.д.)
   Элементу задаётся data-share-wa | data-share-tg,
   опц. data-url (якорь/страница) и data-title (текст).
   ========================================================= */
window.buildShare = function (el) {
  var url = new URL(el.getAttribute('data-url') || (location.hash || ''), location.href).href;
  var title = el.getAttribute('data-title') || document.title;
  if (el.hasAttribute('data-share-wa')) el.href = 'https://wa.me/?text=' + encodeURIComponent(title + ' — ' + url);
  if (el.hasAttribute('data-share-tg')) el.href = 'https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(title);
  el.target = '_blank'; el.rel = 'noopener';
};
(function () {
  document.querySelectorAll('[data-share-wa],[data-share-tg]').forEach(window.buildShare);
})();

/* =========================================================
   ⭐ 3D-КАРТА ТЕЛА — вращаемая фигура, подсветка мышечных
   групп при наведении + подсказка, клик ведёт на программу.
   Процедурная геометрия (без внешних моделей) → быстро.
   ========================================================= */
(function () {
  var canvas = document.getElementById('bodymap');
  if (!canvas || typeof THREE === 'undefined') return;
  var wrap = canvas.parentElement;

  // Данные мышечных групп
  var GROUPS = {
    strength: { color: 0xa9dd2b, title: 'Плечи · руки · грудь', muscles: 'Дельты, бицепс, грудные', tag: 'Силовая', href: 'programmy.html#strength' },
    core:     { color: 0x7b6cff, title: 'Кор · пресс',        muscles: 'Прямая и косые мышцы живота', tag: 'Йога & Кор', href: 'programmy.html#yoga' },
    legs:     { color: 0x19c2a8, title: 'Ноги · ягодицы',     muscles: 'Квадрицепс, бицепс бедра, ягодичные', tag: 'HIIT', href: 'programmy.html#hiit' }
  };

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.3, 8.6);
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;

  function resize() {
    var w = canvas.clientWidth || 400, h = canvas.clientHeight || 500;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd6e6c9, 0.9));
  var key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(4, 7, 6); scene.add(key);
  var rim = new THREE.DirectionalLight(0xbfeaff, 0.7); rim.position.set(-5, 3, -4); scene.add(rim);

  var figure = new THREE.Group(); scene.add(figure);
  var regions = { strength: [], core: [], legs: [] };
  var neutral = 0xeef2f2;

  function mat(regionKey) {
    var m = new THREE.MeshStandardMaterial({ color: neutral, roughness: 0.5, metalness: 0.05, emissive: 0x000000 });
    m.userData.base = new THREE.Color(GROUPS[regionKey].color);
    m.userData.rest = new THREE.Color(neutral);
    return m;
  }
  function limb(radius, len, region) {
    var g = new THREE.CapsuleGeometry(radius, len, 8, 16);
    var m = new THREE.Mesh(g, mat(region));
    m.userData.region = region; regions[region].push(m); figure.add(m);
    return m;
  }
  function ball(radius, region) {
    var m = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 20), mat(region));
    m.userData.region = region; regions[region].push(m); figure.add(m);
    return m;
  }

  // Голова + шея (нейтральные, без региона — просто фигура)
  var headMat = new THREE.MeshStandardMaterial({ color: neutral, roughness: 0.5, metalness: 0.05 });
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 24), headMat); head.position.set(0, 2.55, 0); figure.add(head);
  var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.3, 16), headMat); neck.position.set(0, 2.15, 0); figure.add(neck);

  // Торс: грудь/плечи (strength) + пресс (core)
  var chest = limb(0.5, 0.5, 'strength'); chest.position.set(0, 1.55, 0);
  var core  = limb(0.44, 0.42, 'core');   core.position.set(0, 0.95, 0);
  var pelvis = ball(0.46, 'core');         pelvis.position.set(0, 0.5, 0);

  // Плечи
  ball(0.24, 'strength').position.set(-0.62, 1.85, 0);
  ball(0.24, 'strength').position.set( 0.62, 1.85, 0);
  // Руки (strength)
  [-1, 1].forEach(function (s) {
    var up = limb(0.16, 0.6, 'strength'); up.position.set(s * 0.72, 1.35, 0); up.rotation.z = s * 0.18;
    var fore = limb(0.14, 0.6, 'strength'); fore.position.set(s * 0.86, 0.6, 0); fore.rotation.z = s * 0.12;
    var hand = ball(0.15, 'strength'); hand.position.set(s * 0.93, 0.15, 0);
  });
  // Ноги (legs)
  [-1, 1].forEach(function (s) {
    var thigh = limb(0.2, 0.62, 'legs'); thigh.position.set(s * 0.24, -0.15, 0);
    var shin  = limb(0.16, 0.62, 'legs'); shin.position.set(s * 0.26, -1.0, 0);
    var foot  = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.5), mat('legs'));
    foot.userData.region = 'legs'; regions.legs.push(foot); foot.position.set(s * 0.26, -1.5, 0.14); figure.add(foot);
  });

  figure.position.y = -0.55;
  figure.rotation.y = -0.35;

  // ---- подсказка ----
  var tip = document.createElement('div'); tip.className = 'bm-tip'; wrap.appendChild(tip);

  // ---- вращение перетаскиванием + инерция ----
  var dragging = false, moved = false, px = 0, py = 0, angVx = 0, angVy = 0;
  var _x = new THREE.Vector3(), _y = new THREE.Vector3(), _q = new THREE.Quaternion();
  function rotateScreen(ax, ay) {
    camera.matrixWorld.extractBasis(_x, _y, new THREE.Vector3());
    _q.setFromAxisAngle(_x, ax); figure.quaternion.premultiply(_q);
    _q.setFromAxisAngle(_y, ay); figure.quaternion.premultiply(_q);
  }

  var raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
  var hovered = null;

  function pick(clientX, clientY) {
    var r = canvas.getBoundingClientRect();
    ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    var hits = raycaster.intersectObjects(figure.children, false);
    for (var i = 0; i < hits.length; i++) { if (hits[i].object.userData.region) return hits[i].object.userData.region; }
    return null;
  }
  function setHover(region, cx, cy) {
    if (region === hovered) { if (region) moveTip(cx, cy); return; }
    hovered = region;
    canvas.style.cursor = region ? 'pointer' : 'grab';
    if (!region) { tip.classList.remove('is-on'); return; }
    var g = GROUPS[region];
    tip.innerHTML = '<b>' + g.title + '</b>' + g.muscles + '<span class="bm-tip__m">→ ' + g.tag + '</span>';
    tip.classList.add('is-on'); moveTip(cx, cy);
  }
  function moveTip(cx, cy) {
    var r = wrap.getBoundingClientRect();
    var x = cx - r.left + 14, y = cy - r.top + 14;
    x = Math.min(x, r.width - 232); y = Math.min(y, r.height - 90);
    tip.style.left = Math.max(8, x) + 'px'; tip.style.top = Math.max(8, y) + 'px';
  }

  canvas.addEventListener('pointerdown', function (e) {
    dragging = true; moved = false; px = e.clientX; py = e.clientY; angVx = angVy = 0;
    canvas.style.cursor = 'grabbing'; canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', function (e) {
    if (dragging) {
      var dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      var ax = dy * 0.01, ay = dx * 0.01; rotateScreen(ax, ay); angVx = ax; angVy = ay;
      tip.classList.remove('is-on'); hovered = null;
    } else {
      setHover(pick(e.clientX, e.clientY), e.clientX, e.clientY);
    }
  });
  window.addEventListener('pointerup', function (e) {
    if (dragging && !moved) {
      var region = pick(e.clientX, e.clientY);
      if (region) { location.href = GROUPS[region].href; return; }
    }
    dragging = false; if (canvas.style.cursor === 'grabbing') canvas.style.cursor = 'grab';
  });
  canvas.addEventListener('pointerleave', function () { if (!dragging) setHover(null); });

  // ---- цикл ----
  var clock = new THREE.Clock();
  function tick() {
    if (!dragging) {
      angVx *= 0.94; angVy *= 0.94;
      var idle = (Math.abs(angVx) + Math.abs(angVy) < 0.0006) ? 0.0035 : 0;
      rotateScreen(angVx, angVy + idle);
    }
    figure.position.y = -0.55 + Math.sin(clock.getElapsedTime() * 0.9) * 0.05;
    // подсветка активного региона
    Object.keys(regions).forEach(function (key) {
      var on = key === hovered;
      regions[key].forEach(function (m) {
        var mm = m.material;
        mm.color.lerp(on ? mm.userData.base : mm.userData.rest, 0.18);
        mm.emissive.lerp(on ? mm.userData.base : new THREE.Color(0x000000), 0.18);
        mm.emissiveIntensity = 0.35;
      });
    });
    renderer.render(scene, camera); requestAnimationFrame(tick);
  }
  resize(); window.addEventListener('resize', resize); setTimeout(resize, 200); tick();
})();

/* =========================================================
   Таймер-тренировка (демо мини-программы) на лендинге
   ========================================================= */
(function () {
  var root = document.getElementById('timer'); if (!root) return;
  var phaseEl = root.querySelector('.timer__phase');
  var timeEl  = root.querySelector('.timer__time');
  var exEl    = root.querySelector('.timer__ex');
  var ring    = root.querySelector('.timer__ring circle.fg');
  var startBtn= document.getElementById('t-start');
  var resetBtn= document.getElementById('t-reset');

  var plan = [
    { name: 'Разминка · суставная', sec: 20, phase: 'Разминка' },
    { name: 'Приседания', sec: 30, phase: 'Работа' },
    { name: 'Отдых', sec: 10, phase: 'Отдых' },
    { name: 'Планка', sec: 30, phase: 'Работа' },
    { name: 'Отдых', sec: 10, phase: 'Отдых' },
    { name: 'Выпады', sec: 30, phase: 'Работа' },
    { name: 'Заминка · растяжка', sec: 20, phase: 'Заминка' }
  ];
  var i = 0, left = plan[0].sec, timer = null, running = false;
  var R = 52, CIRC = 2 * Math.PI * R;
  if (ring) { ring.style.strokeDasharray = CIRC; ring.style.strokeDashoffset = 0; }

  function render() {
    var step = plan[i];
    phaseEl.textContent = step.phase;
    timeEl.textContent = '0:' + String(left).padStart(2, '0');
    exEl.textContent = step.name + '  ·  ' + (i + 1) + '/' + plan.length;
    if (ring) ring.style.strokeDashoffset = CIRC * (1 - left / step.sec);
  }
  function stop() { running = false; clearInterval(timer); startBtn.textContent = 'Продолжить'; }
  function reset() { stop(); i = 0; left = plan[0].sec; startBtn.textContent = 'Начать тренировку'; render(); }
  function tickSec() {
    left--;
    if (left < 0) {
      i++;
      if (i >= plan.length) { reset(); showToast('🔥 Мини-тренировка завершена! Готовы к настоящей?'); return; }
      left = plan[i].sec;
    }
    render();
  }
  startBtn && startBtn.addEventListener('click', function () {
    if (running) { stop(); return; }
    running = true; startBtn.textContent = 'Пауза'; render();
    timer = setInterval(tickSec, 1000);
  });
  resetBtn && resetBtn.addEventListener('click', reset);
  render();
})();

/* =========================================================
   Интерактивное расписание: клик по занятию → бронь слота
   ========================================================= */
(function () {
  var table = document.querySelector('.sched'); if (!table) return;
  var heads = [].slice.call(table.querySelectorAll('thead th'));
  var C = window.SITE || {};
  table.querySelectorAll('tbody tr').forEach(function (tr) {
    var cells = [].slice.call(tr.children);
    var day = (cells[0] ? cells[0].textContent : '').trim();
    cells.forEach(function (td, idx) {
      var cls = td.querySelector('.cls'); if (!cls) return;
      var time = heads[idx] ? heads[idx].textContent.trim() : '';
      var slot = day + ', ' + time + ' — ' + cls.textContent.trim();
      td.classList.add('sched-cell');
      td.setAttribute('role', 'button');
      td.setAttribute('tabindex', '0');
      td.setAttribute('aria-label', 'Забронировать: ' + slot);
      function go() {
        if (C.bookingUrl) { window.open(C.bookingUrl, '_blank', 'noopener'); return; }
        location.href = 'kontakty.html?slot=' + encodeURIComponent(slot) + '#zapis';
      }
      td.addEventListener('click', go);
      td.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  });
})();

/* =========================================================
   Приём выбранного слота на странице контактов (?slot=…)
   ========================================================= */
(function () {
  var slot = new URLSearchParams(location.search).get('slot'); if (!slot) return;
  var msg = document.getElementById('lead-msg');
  if (msg) msg.value = 'Хочу записаться на слот: ' + slot;
  var form = document.getElementById('zapis');
  if (form) setTimeout(function () { form.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 250);
  setTimeout(function () { showToast('📅 Выбран слот: ' + slot); }, 500);
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
    form.querySelectorAll('input, select, button, textarea').forEach(function (el) { el.disabled = true; });
    if (thanks) thanks.hidden = false;
    showToast('✓ Заявка отправлена! Свяжусь с вами в течение дня');
  });
})();

/* минимальная дата = сегодня */
(function () {
  var d = document.getElementById('lead-date'); if (!d) return;
  var t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
  d.min = t.toISOString().slice(0, 10);
})();

/* =========================================================
   Появление при скролле
   ========================================================= */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.style.transition = 'opacity .6s ease, transform .6s ease';
        e.target.style.opacity = 1; e.target.style.transform = 'none';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(function (el, i) { el.style.transitionDelay = (i % 6 * 60) + 'ms'; io.observe(el); });
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
  window.addEventListener('pointerup', function () { dragging = false; });
})();

/* =========================================================
   Квиз «Подберите программу» → рекомендация + запись
   ========================================================= */
(function () {
  var root = document.getElementById('quiz-widget'); if (!root) return;
  var bar = document.getElementById('quiz-bar');
  var body = document.getElementById('quiz-body');
  var C = window.SITE || {};
  var bookHref = C.bookingUrl ? C.bookingUrl : 'kontakty.html#zapis';

  var steps = [
    { s: 'Шаг 1 из 3', q: 'Какая у вас главная цель?', opts: [
      ['Похудеть и подсушиться', 'hiit'], ['Набрать форму и силу', 'strength'],
      ['Гибкость и меньше стресса', 'yoga'], ['Восстановиться / спина', 'rehab'] ] },
    { s: 'Шаг 2 из 3', q: 'Ваш опыт тренировок?', opts: [
      ['Я новичок', ''], ['Занимался(ась) раньше', ''], ['Тренируюсь регулярно', ''] ] },
    { s: 'Шаг 3 из 3', q: 'Сколько раз в неделю готовы заниматься?', opts: [
      ['1–2 раза', ''], ['3 раза', ''], ['4 и больше', ''] ] }
  ];
  var results = {
    strength: { name: 'Силовые тренировки', tag: 'Сила', href: 'programmy.html#strength', desc: 'Рост силы, рельеф и крепкая спина — под ваш уровень и с чистой техникой.' },
    yoga:     { name: 'Йога & растяжка',    tag: 'Баланс', href: 'programmy.html#yoga', desc: 'Гибкость, дыхание и антистресс. Бережно для спины и суставов.' },
    hiit:     { name: 'HIIT-интервалы',     tag: 'Жиросжигание', href: 'programmy.html#hiit', desc: 'Максимум результата за 30–40 минут. Энергия и быстрый расход калорий.' },
    rehab:    { name: 'Реабилитация & спина', tag: 'Здоровье', href: 'programmy.html#rehab', desc: 'Мягкое восстановление и работа с осанкой в комфортном темпе.' }
  };
  var i = 0, goal = 'strength';

  function renderStep() {
    var st = steps[i];
    bar.style.width = ((i) / steps.length * 100 + 12) + '%';
    var html = '<div class="quiz__step">' + st.s + '</div><div class="quiz__q">' + st.q + '</div><div class="quiz__opts">';
    st.opts.forEach(function (o, k) { html += '<button class="quiz__opt" data-val="' + o[1] + '">' + o[0] + '</button>'; });
    html += '</div>';
    body.innerHTML = html;
  }
  function renderResult() {
    bar.style.width = '100%';
    var r = results[goal] || results.strength;
    var progUrl = new URL(r.href, location.href).href;
    var shareTxt = 'Мне подобрали программу «' + r.name + '» в ' + (C.studio || 'студии') + ' — глянь';
    var waUrl = 'https://wa.me/?text=' + encodeURIComponent(shareTxt + ' ' + progUrl);
    var tgUrl = 'https://t.me/share/url?url=' + encodeURIComponent(progUrl) + '&text=' + encodeURIComponent(shareTxt);
    body.innerHTML = '<div class="quiz__result"><div class="quiz__badge">Ваша программа · ' + r.tag + '</div>' +
      '<h3>' + r.name + '</h3><p>' + r.desc + '</p>' +
      '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">' +
      '<a href="' + bookHref + '" class="btn btn--accent btn--lg"' + (C.bookingUrl ? ' target="_blank" rel="noopener"' : '') + '>Записаться на пробное</a>' +
      '<a href="' + r.href + '" class="btn btn--outline btn--lg">Подробнее о программе</a></div>' +
      '<div class="share-row" style="justify-content:center"><span>Скинуть другу:</span>' +
      '<a class="share-chip share-chip--tg" href="' + tgUrl + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3l-3.1 14.7c-.2 1-.9 1.3-1.7.8l-4.6-3.4-2.2 2.1c-.2.2-.5.4-.9.4l.3-4.6 8.4-7.6c.4-.3-.1-.5-.6-.2L7.8 13 3.3 11.6c-1-.3-1-1 .2-1.5L20.6 3.4c.8-.3 1.5.2 1.3 1z"/></svg>Telegram</a>' +
      '<a class="share-chip share-chip--wa" href="' + waUrl + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.7 15l-1.3 5 5-1.3A10 10 0 1 0 12 2zm5.5 12.4c-.3.8-1.4 1.4-2 1.4-.5.1-1.2.1-3.6-.8-3-1.3-5-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3.1s.7-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .5 0 .7.5.3.6 1 2.3 1 2.5.1.1.1.3 0 .5-.3.6-.6.8-.8 1.1-.2.2-.2.4-.1.6.2.3.8 1.3 1.7 2 1.1.9 2 1.2 2.3 1.4.3.1.5.1.7-.2.2-.2.6-.8.9-1.1.2-.3.4-.2.7-.1.3.1 1.7.8 2 .9.3.1.5.2.6.3z"/></svg>WhatsApp</a></div>' +
      '<button class="quiz__again" id="quiz-again">← Пройти заново</button></div>';
  }
  body.addEventListener('click', function (e) {
    var opt = e.target.closest('.quiz__opt');
    if (opt) {
      if (i === 0 && opt.dataset.val) goal = opt.dataset.val;
      i++;
      if (i >= steps.length) renderResult(); else renderStep();
      return;
    }
    if (e.target.id === 'quiz-again') { i = 0; goal = 'strength'; renderStep(); }
  });
  renderStep();
})();
