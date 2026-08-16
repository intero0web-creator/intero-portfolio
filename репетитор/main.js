/* Аналитика */
(function () {
  var C = window.SITE || {};
  if (C.YM_ID) { (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym"); ym(C.YM_ID, "init", { clickmap:true, trackLinks:true }); }
  if (C.GA_ID) { var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + C.GA_ID; document.head.appendChild(s); window.dataLayer = window.dataLayer || []; window.gtag = function(){ dataLayer.push(arguments); }; gtag('js', new Date()); gtag('config', C.GA_ID); }
})();

/* Config → страница */
(function () {
  var C = window.SITE || {};
  document.querySelectorAll('[data-bind]').forEach(function (el) {
    var k = el.getAttribute('data-bind'); if (C[k]) el.textContent = C[k];
  });
  if (C.phoneRaw) document.querySelectorAll('[data-tel]').forEach(function (el) { el.href = 'tel:' + C.phoneRaw; });
  if (C.email) document.querySelectorAll('[data-mail]').forEach(function (el) { el.href = 'mailto:' + C.email; });
  document.querySelectorAll('[data-social]').forEach(function (el) {
    var k = el.getAttribute('data-social'); if (C[k]) el.href = C[k];
  });
})();

/* Калькулятор роста баллов */
(function () {
  var cur = document.getElementById('score-cur');
  var months = document.getElementById('score-months');
  var monthsV = document.getElementById('months-v');
  var out = document.getElementById('score-out');
  var chart = document.getElementById('chart-line');
  var area = document.getElementById('chart-area');
  var dot = document.getElementById('chart-dot');
  if (!cur || !months || !out) return;

  function calc() {
    var start = Math.max(20, Math.min(100, parseInt(cur.value, 10) || 60));
    var m = Math.max(1, parseInt(months.value, 10) || 6);
    monthsV.textContent = m + ' мес.';
    // прирост зависит от расстояния до 100 и от длительности — итог всегда >= start
    var room = Math.max(0, 100 - start);            // сколько ещё возможно набрать
    var effect = Math.min(1, m / 9);                // насыщение к 9 мес
    var gain = Math.round(room * 0.72 * effect);    // прирост
    var final = Math.min(100, start + gain);
    out.textContent = final;

    // кривая — от start к final, гладкая
    var pts = [];
    for (var i = 0; i <= m; i++) {
      var progress = i / m;
      var value = start + gain * (1 - Math.pow(1 - progress, 1.6));
      var x = 40 + (i / m) * 500;
      var y = 180 - ((value - 20) / 80) * 150;      // диапазон оси 20..100
      pts.push([x, y]);
    }
    var d = 'M' + pts.map(function (p) { return p[0] + ' ' + p[1]; }).join(' L');
    if (chart) chart.setAttribute('d', d);
    if (area) area.setAttribute('d', d + ' L540 180 L40 180 Z');
    if (dot) { dot.setAttribute('cx', pts[pts.length-1][0]); dot.setAttribute('cy', pts[pts.length-1][1]); }
  }
  cur.addEventListener('input', calc);
  months.addEventListener('input', calc);
  calc();
})();

/* Квиз уровня */
(function () {
  var box = document.getElementById('quiz'); if (!box) return;
  var qs = [
    { q: 'Как ты чувствуешь себя перед контрольной?', opts: [
      { t: 'Спокойно, готов ко всему', s: 3 },
      { t: 'Волнуюсь, но справляюсь', s: 2 },
      { t: 'Сильно нервничаю', s: 1 },
      { t: 'Стараюсь не думать', s: 0 } ] },
    { q: 'Какая оценка обычно?', opts: [
      { t: 'Стабильно 5', s: 3 }, { t: 'Между 4 и 5', s: 2 },
      { t: 'Между 3 и 4', s: 1 }, { t: '2–3', s: 0 } ] },
    { q: 'Сколько времени в неделю тратишь на предмет?', opts: [
      { t: '5+ часов', s: 3 }, { t: '3–5 часов', s: 2 },
      { t: '1–2 часа', s: 1 }, { t: 'Только уроки', s: 0 } ] },
    { q: 'Твоя цель?', opts: [
      { t: 'Топ-вуз, 90+ баллов', s: 3 }, { t: 'Хорошая сдача, 70+', s: 2 },
      { t: 'Просто сдать, 50+', s: 1 }, { t: 'Пока не думал', s: 0 } ] }
  ];
  var idx = 0, score = 0;

  function render() {
    if (idx >= qs.length) return finish();
    var q = qs[idx];
    var prog = '<div class="quiz__prog">';
    for (var i = 0; i < qs.length; i++) prog += '<i class="' + (i < idx ? 'is-done' : '') + '"></i>';
    prog += '</div>';
    var opts = q.opts.map(function (o, i) {
      return '<button class="quiz__opt" data-s="' + o.s + '">' + o.t + '</button>';
    }).join('');
    box.innerHTML = prog + '<div class="quiz__q">' + q.q + '</div><div class="quiz__opts">' + opts + '</div>';
    box.querySelectorAll('.quiz__opt').forEach(function (b) {
      b.addEventListener('click', function () { score += parseInt(b.dataset.s, 10); idx++; render(); });
    });
  }
  function finish() {
    var max = qs.length * 3;
    var pct = score / max;
    var level, note;
    if (pct >= 0.75) { level = 'Уверенный'; note = 'Ты близок к цели — с точечной работой над сложными темами реально выйти на 85–95 баллов.'; }
    else if (pct >= 0.5) { level = 'Средний'; note = 'Крепкая база есть, но много «слепых зон». За 4–6 месяцев можно поднять до 75–85 баллов.'; }
    else if (pct >= 0.25) { level = 'Ниже среднего'; note = 'Много пробелов, но время есть. С систематикой через 6–8 месяцев — 65–75 баллов реально.'; }
    else { level = 'Начальный'; note = 'Начнём с основ. Первые результаты — через месяц, серьёзные — через полгода.'; }
    box.innerHTML = '<div class="quiz__result"><h3>' + level + ' уровень</h3><p>' + note + '</p><a href="#form" class="btn btn--primary">Записаться на пробный урок</a></div>';
  }
  render();
})();

/* Тост + форма */
function showToast(m) { var t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t); requestAnimationFrame(function(){t.classList.add('is-show');}); setTimeout(function(){t.classList.remove('is-show'); setTimeout(function(){t.remove();},400);},4000); }
(function () {
  var f = document.getElementById('lead-form'); if (!f) return;
  var d = document.getElementById('lead-date');
  if (d) { var t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset()); d.min = t.toISOString().slice(0,10); }
  f.addEventListener('submit', function (e) {
    e.preventDefault(); if (!f.checkValidity()) { f.reportValidity(); return; }
    f.querySelectorAll('input,select,button').forEach(function(el){el.disabled=true;});
    var th = document.getElementById('form-thanks'); if (th) th.hidden = false;
    showToast('✓ Заявка отправлена');
  });
})();

/* Появление при скролле */
(function () {
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) {
    if (e.isIntersecting) { e.target.style.opacity = 1; e.target.style.transform = 'none'; io.unobserve(e.target); }
  }); }, { threshold: 0.12 });
  document.querySelectorAll('.tile, .review, .price').forEach(function (el, i) {
    el.style.opacity = 0; el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .5s ' + (i * 50) + 'ms ease, transform .5s ' + (i * 50) + 'ms ease';
    io.observe(el);
  });
})();

/* 3D-глобус: сфера с материками, свободное вращение */
(function () {
  var canvas = document.getElementById('globe3d');
  if (!canvas || typeof THREE === 'undefined') return;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 4.6);
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;

  function resize() {
    var w = canvas.clientWidth || 380, h = canvas.clientHeight || 380;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  // студийная карта окружения — блик сверху
  (function () {
    var c = document.createElement('canvas'); c.width = 32; c.height = 128;
    var g = c.getContext('2d');
    var gr = g.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.25, '#a8e0c4');
    gr.addColorStop(0.6, '#22c98b'); gr.addColorStop(1, '#0a1628');
    g.fillStyle = gr; g.fillRect(0, 0, 32, 128);
    g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(0, 8, 32, 6);
    var t = new THREE.CanvasTexture(c);
    t.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = t;
  })();

  scene.add(new THREE.HemisphereLight(0xffffff, 0x0a1628, 0.6));
  var key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(4, 3, 5); scene.add(key);
  var rim = new THREE.DirectionalLight(0x6ee0b1, 0.6); rim.position.set(-4, 1, -3); scene.add(rim);

  // текстура — реалистичная Земля: тёмный океан + материки по настоящей географии
  var tex = (function () {
    var w = 2048, h = 1024;
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d');
    // океан (тёмно-синий, как из космоса)
    var oc = g.createLinearGradient(0, 0, 0, h);
    oc.addColorStop(0, '#0a2440'); oc.addColorStop(0.5, '#0e3255'); oc.addColorStop(1, '#081c34');
    g.fillStyle = oc; g.fillRect(0, 0, w, h);

    // конвертер: широта/долгота → пиксели равнопромежуточной проекции
    // lon: -180..180 → 0..w ; lat: 90..-90 → 0..h
    function ll(lon, lat) { return [(lon + 180) / 360 * w, (90 - lat) / 180 * h]; }
    function polygon(coords, fill) {
      g.beginPath();
      coords.forEach(function (p, i) {
        var pt = ll(p[0], p[1]);
        if (i === 0) g.moveTo(pt[0], pt[1]); else g.lineTo(pt[0], pt[1]);
      });
      g.closePath();
      if (fill) { g.fillStyle = fill; g.fill(); }
    }

    // Основной цвет суши — приглушённый зелёный (Земля из космоса)
    var land = '#2f6d3f';
    var landDark = '#264d2c';
    var ice = '#dfe7ec';

    // ЕВРАЗИЯ (крупный полигон — упрощённые контуры)
    polygon([[-10,36],[0,45],[10,54],[20,60],[30,66],[50,68],[70,72],[100,73],[130,72],[145,60],[145,50],[135,45],[130,35],[120,25],[105,10],[95,20],[80,20],[75,30],[65,25],[55,15],[45,15],[38,10],[43,30],[35,32],[30,32],[15,36],[0,36]], land);
    // Индия/Аравия хвост
    polygon([[40,15],[50,25],[60,25],[70,20],[78,10],[85,20],[80,30],[70,32],[55,35],[43,20]], land);
    // Скандинавия
    polygon([[5,55],[10,62],[18,68],[26,70],[30,66],[22,60],[15,58]], land);

    // АФРИКА
    polygon([[-10,32],[10,35],[25,32],[35,32],[42,15],[52,10],[50,0],[42,-8],[38,-18],[26,-30],[18,-34],[8,-30],[0,-15],[-10,-5],[-15,10],[-15,25]], land);

    // СЕВЕРНАЯ АМЕРИКА
    polygon([[-165,60],[-155,70],[-130,72],[-100,72],[-80,72],[-70,70],[-60,55],[-55,48],[-70,42],[-80,32],[-95,25],[-100,20],[-95,15],[-88,15],[-80,25],[-88,30],[-102,32],[-115,32],[-125,40],[-125,55],[-135,60],[-155,60]], land);
    // Гренландия
    polygon([[-50,60],[-35,60],[-20,70],[-25,82],[-40,82],[-52,75],[-55,68]], land);
    // Аляска-хвост
    polygon([[-170,55],[-160,55],[-155,60],[-165,66]], land);

    // ЮЖНАЯ АМЕРИКА
    polygon([[-80,10],[-70,12],[-58,7],[-50,0],[-38,-5],[-35,-15],[-40,-25],[-53,-35],[-65,-45],[-70,-55],[-73,-53],[-72,-40],[-78,-30],[-80,-15],[-80,0]], land);

    // АВСТРАЛИЯ
    polygon([[113,-22],[125,-14],[135,-12],[143,-12],[153,-25],[150,-35],[138,-38],[125,-33],[115,-30]], land);
    // Новая Зеландия
    polygon([[172,-40],[176,-40],[178,-46],[170,-46]], land);

    // АНТАРКТИДА
    g.fillStyle = ice; g.fillRect(0, h * (90 + 66) / 180, w, h - h * (90 + 66) / 180);

    // сетка широта/долгота — тонкая
    g.strokeStyle = 'rgba(180,200,220,0.08)'; g.lineWidth = 1;
    for (var i = 1; i < 12; i++) { var xg = (w / 12) * i; g.beginPath(); g.moveTo(xg, 0); g.lineTo(xg, h); g.stroke(); }
    for (var j = 1; j < 6; j++) { var yg = (h / 6) * j; g.beginPath(); g.moveTo(0, yg); g.lineTo(w, yg); g.stroke(); }
    // экватор
    g.strokeStyle = 'rgba(255,255,255,0.15)'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(0, h/2); g.lineTo(w, h/2); g.stroke();

    var t = new THREE.CanvasTexture(c);
    if ('colorSpace' in t) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();

  var globe = new THREE.Mesh(
    new THREE.SphereGeometry(1.3, 64, 48),
    new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.55, metalness: 0.1, clearcoat: 0.5, clearcoatRoughness: 0.3, envMapIntensity: 1.2 })
  );
  scene.add(globe);

  // мягкая атмосфера — без кольца
  var atm = new THREE.Mesh(
    new THREE.SphereGeometry(1.44, 48, 32),
    new THREE.MeshBasicMaterial({ color: 0x6ea0ff, transparent: true, opacity: 0.06, side: THREE.BackSide })
  );
  scene.add(atm);

  globe.rotation.y = -0.4;
  globe.rotation.x = 0.15;

  // свободное вращение
  var dragging = false, px = 0, py = 0, vx = 0, vy = 0;
  var _x = new THREE.Vector3(), _y = new THREE.Vector3(), _q = new THREE.Quaternion();
  function rotateScreen(ax, ay) {
    camera.matrixWorld.extractBasis(_x, _y, new THREE.Vector3());
    _q.setFromAxisAngle(_x, ax); globe.quaternion.premultiply(_q);
    _q.setFromAxisAngle(_y, ay); globe.quaternion.premultiply(_q);
  }
  canvas.addEventListener('pointerdown', function (e) {
    dragging = true; px = e.clientX; py = e.clientY; vx = vy = 0;
    canvas.setPointerCapture(e.pointerId);
  });
  window.addEventListener('pointerup', function () { dragging = false; });
  window.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY;
    var ax = dy * 0.008, ay = dx * 0.008;
    rotateScreen(ax, ay); vx = ay; vy = ax;
  });

  var clock = new THREE.Clock();
  function tick() {
    if (!dragging) {
      vx *= 0.94; vy *= 0.94;
      var idle = (Math.abs(vx) + Math.abs(vy) < 0.0006) ? 0.003 : 0;
      rotateScreen(vy, vx + idle);
    }
    ring.rotation.z += 0.002;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  resize(); window.addEventListener('resize', resize); setTimeout(resize, 200); tick();
})();
