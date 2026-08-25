/* =========================================================
   Применение настроек из config.js ко всей странице.
   ========================================================= */
(function () {
  var C = window.SITE || {};
  C.footerCopy = (C.footerLine1 || '') + ' ' + (C.name || '');
  C.footerReg = 'Реестровый номер ' + (C.regNumber || '').replace(/^№\s*/, '') +
                ' · ' + (C.footerLine2 || 'Адвокатская палата') + ' ' + (C.regCity || '');

  document.querySelectorAll('[data-bind]').forEach(function (el) {
    var key = el.getAttribute('data-bind');
    if (C[key] != null && C[key] !== '') el.textContent = C[key];
  });
  if (C.phoneRaw) document.querySelectorAll('[data-tel]').forEach(function (el) { el.setAttribute('href', 'tel:' + C.phoneRaw); });
  if (C.email) document.querySelectorAll('[data-mail]').forEach(function (el) { el.setAttribute('href', 'mailto:' + C.email); });
  document.querySelectorAll('[data-social]').forEach(function (el) {
    var k = el.getAttribute('data-social');
    if (C[k]) el.setAttribute('href', C[k]);
  });

  if (C.photo) {
    var box = document.querySelector('[data-photo]');
    if (box) {
      box.innerHTML = '';
      var img = document.createElement('img');
      img.src = C.photo; img.alt = C.name || 'Фото юриста'; img.className = 'about__img';
      box.appendChild(img);
    }
  }
  if (C.name) {
    var base = document.title.split('—').slice(1).join('—').trim();
    document.title = C.name + (base ? ' — ' + base : '');
  }
})();

/* =========================================================
   Аналитика — подключается, только если в config.js указан ID
   ========================================================= */
(function () {
  var C = window.SITE || {};
  var YM = C.YM_ID || C.yandexMetrika;   // поддержка обоих имён
  var GA = C.GA_ID || C.googleAnalytics;
  // Яндекс.Метрика
  if (YM) {
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);})
    (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
    ym(YM, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true });
  }
  // Google Analytics 4
  if (GA) {
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA);
  }
})();

/* =========================================================
   Живой фон — золотые пылинки (на всех страницах)
   ========================================================= */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var layer = document.createElement('div');
  layer.className = 'site-dust';
  layer.setAttribute('aria-hidden', 'true');
  var count = window.innerWidth < 700 ? 30 : 55;
  for (var i = 0; i < count; i++) {
    var d = document.createElement('i');
    var s = Math.random() * 2.6 + 1.4;
    d.style.width = d.style.height = s.toFixed(1) + 'px';
    d.style.left = (Math.random() * 100).toFixed(2) + '%';
    d.style.animationDuration = (Math.random() * 7 + 7).toFixed(1) + 's';
    d.style.animationDelay = (-Math.random() * 14).toFixed(1) + 's';
    layer.appendChild(d);
  }
  document.body.appendChild(layer);
})();

/* =========================================================
   Мобильное меню (бургер)
   ========================================================= */
(function () {
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobile-menu');
  if (!burger || !menu) return;
  burger.addEventListener('click', function () { menu.classList.toggle('is-open'); });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { menu.classList.remove('is-open'); });
  });
})();

/* =========================================================
   Весы Фемиды — SVG-графика (только на главной)
   ========================================================= */
(function () {
  var svg = document.getElementById('scales');
  if (!svg) return;
  var beam = document.getElementById('scales-beam');
  var panL = document.getElementById('scales-pan-l');
  var panR = document.getElementById('scales-pan-r');
  if (!beam || !panL || !panR) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PIVOT_X = 190, PIVOT_Y = 92, LX = 66, RX = 314, ATT_Y = 92;
  var mouseX = 0, curMouse = 0;
  var hero = svg.closest('.hero') || svg;
  hero.addEventListener('pointermove', function (e) {
    var r = svg.getBoundingClientRect();
    mouseX = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouseX = Math.max(-1, Math.min(1, mouseX));
  });

  function apply(a) {
    beam.setAttribute('transform', 'rotate(' + a + ' ' + PIVOT_X + ' ' + PIVOT_Y + ')');
    panL.setAttribute('transform', 'rotate(' + (-a) + ' ' + LX + ' ' + ATT_Y + ')');
    panR.setAttribute('transform', 'rotate(' + (-a) + ' ' + RX + ' ' + ATT_Y + ')');
  }
  if (reduce) { apply(0); return; }

  var start = performance.now();
  (function tick(now) {
    var t = (now - start) / 1000;
    curMouse += (mouseX - curMouse) * 0.07;
    apply(Math.sin(t * 0.6) * 3.0 + curMouse * 7.5);
    requestAnimationFrame(tick);
  })(start);
})();

/* =========================================================
   Плавная анимация числа
   ========================================================= */
function animateNumber(el, target) {
  var start = parseFloat(el.dataset.cur || '0');
  var t0 = performance.now();
  (function step(now) {
    var p = Math.min(1, (now - t0) / 500);
    var eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(start + (target - start) * eased).toLocaleString('ru-RU');
    if (p < 1) requestAnimationFrame(step); else el.dataset.cur = target;
  })(t0);
}

/* =========================================================
   Калькулятор (только на странице услуг)
   ========================================================= */
(function () {
  var tabs = document.querySelectorAll('.calc__tab');
  var panels = document.querySelectorAll('.calc__panel');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var key = tab.dataset.tab;
      tabs.forEach(function (t) { t.classList.toggle('is-active', t === tab); });
      panels.forEach(function (p) { p.classList.toggle('is-active', p.dataset.panel === key); });
    });
  });
})();

(function () {
  var type = document.getElementById('fine-type');
  if (!type) return;
  var sum = document.getElementById('fine-sum'), days = document.getElementById('fine-days');
  var daysV = document.getElementById('fine-days-v'), out = document.getElementById('fine-value');
  var CB = 0.16; // ключевая ставка ЦБ (условно), используется в пенях
  function calc() {
    var s = Math.max(0, parseFloat(sum.value) || 0), d = parseInt(days.value, 10) || 0;
    daysV.textContent = d;
    var r = 0;
    switch (type.value) {
      // Налоги: ст. 122 НК — штраф 20% + пеня физлица 1/300 ставки ЦБ за день
      case 'tax': r = s * 0.20 + s * (CB / 300) * d; break;
      // Административное: ст. 20.25 КоАП — при неуплате свыше 60 дней штраф удваивается
      case 'admin': r = (d > 60 ? s * 2 : s); break;
      // Трудовое (в пользу работника): долг + компенсация 1/150 ставки за день (ст. 236 ТК)
      case 'labor': r = s + s * (CB / 150) * d; break;
      // Жилищное: типовой штраф КоАП (напр. ст. 7.21) — фиксированный диапазон
      case 'housing': r = 2500 + Math.min(s, 100000) * 0.02; break;
    }
    animateNumber(out, Math.round(r));
  }
  [type, sum, days].forEach(function (el) { el.addEventListener('input', calc); });
  calc();
})();

(function () {
  var inc = document.getElementById('save-income');
  if (!inc) return;
  var cs = document.getElementById('save-case'), fam = document.getElementById('save-family');
  var famV = document.getElementById('save-family-v'), out = document.getElementById('save-value');
  function calc() {
    var i = Math.max(0, parseFloat(inc.value) || 0), f = parseInt(fam.value, 10) || 1;
    famV.textContent = f;
    var ndfl = i * 0.13, r = 0;
    switch (cs.value) {
      case 'ipn': r = i * 0.06; break;
      case 'deduct': r = Math.min(260000, ndfl); break;
      case 'health': r = Math.min(19500 + (f - 1) * 14300, ndfl); break;
      case 'invest': r = Math.min(52000, ndfl); break;
    }
    animateNumber(out, Math.round(r));
  }
  [inc, cs, fam].forEach(function (el) { el.addEventListener('input', calc); });
  calc();
})();

(function () {
  var svc = document.getElementById('cost-svc');
  if (!svc) return;
  var lvl = document.getElementById('cost-lvl'), urg = document.getElementById('cost-urg');
  var urgV = document.getElementById('cost-urg-v'), out = document.getElementById('cost-value');
  var base = { consult: 3000, doc: 8000, claim: 12000, court: 45000, full: 90000 };
  function calc() {
    var b = base[svc.value] || 0, l = parseFloat(lvl.value) || 1, u = parseInt(urg.value, 10) || 0;
    urgV.textContent = u;
    animateNumber(out, Math.round(b * l * (1 + u / 100) / 100) * 100);
  }
  [svc, lvl, urg].forEach(function (el) { el.addEventListener('input', calc); });
  calc();
})();

/* =========================================================
   Toast-уведомление
   ========================================================= */
function showToast(msg) {
  var t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(function () { t.classList.add('is-show'); });
  setTimeout(function () {
    t.classList.remove('is-show');
    setTimeout(function () { t.remove(); }, 400);
  }, 4000);
}

/* =========================================================
   Форма заявки (только на странице контактов)
   ========================================================= */
(function () {
  var form = document.getElementById('lead-form');
  if (!form) return;
  var thanks = document.getElementById('lead-thanks');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    form.querySelectorAll('input, textarea, button').forEach(function (el) { el.disabled = true; });
    if (thanks) thanks.hidden = false;
    showToast('✓ Заявка отправлена! Перезвоню в течение часа.');
  });
})();

/* =========================================================
   Появление блоков при скролле
   ========================================================= */
(function () {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.style.opacity = 1; e.target.style.transform = 'none'; io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.svc, .why__card, .steps__list li, .review, .case').forEach(function (el, i) {
    el.style.opacity = 0; el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity .6s ' + (i * 60) + 'ms ease, transform .6s ' + (i * 60) + 'ms ease';
    io.observe(el);
  });
})();
