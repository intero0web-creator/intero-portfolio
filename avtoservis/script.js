/* ============ ProDetail — вся интерактивная логика ============ */

/* =========================================================================
   НАСТРОЙКИ ПРОЕКТА — заполняются при внедрении.
   Пока поля пустые: аналитика не грузится, заявки не отправляются
   (форма работает в демо-режиме и просто показывает подтверждение).
   ========================================================================= */
var CFG = {
  YM_ID: '',            // ID Яндекс.Метрики, напр. '98765432'
  GA_ID: '',            // ID Google Analytics 4, напр. 'G-XXXXXXXXXX'

  /* Куда отправлять заявки. Заполните ОДИН из вариантов:
     1) LEAD_URL — адрес вашего обработчика/CRM/Formspree (POST, JSON)
     2) TG_TOKEN + TG_CHAT — отправка напрямую в Telegram-бота          */
  LEAD_URL: '',
  TG_TOKEN: '',
  TG_CHAT: ''
};

/* ---------- аналитика: подключается только если указан ID ---------- */
(function () {
  if (CFG.YM_ID) {
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);})
    (window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
    ym(CFG.YM_ID,'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});
  }
  if (CFG.GA_ID) {
    var s=document.createElement('script'); s.async=true;
    s.src='https://www.googletagmanager.com/gtag/js?id='+CFG.GA_ID;
    document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){dataLayer.push(arguments)};
    gtag('js',new Date()); gtag('config',CFG.GA_ID);
  }
})();

/* отправка цели в аналитику (вызывается при успешной заявке) */
function goal(name) {
  if (CFG.YM_ID && window.ym) ym(CFG.YM_ID,'reachGoal',name);
  if (CFG.GA_ID && window.gtag) gtag('event',name);
}

/* ---------- мобильное меню ---------- */
(function () {
  var b = document.getElementById('burger'), m = document.getElementById('mnav');
  if (!b || !m) return;
  b.addEventListener('click', function () { m.classList.toggle('on'); });
  m.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { m.classList.remove('on'); });
  });
})();

/* ---------- тост ---------- */
function toast(msg) {
  var t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(function () { t.classList.add('on'); });
  setTimeout(function () { t.classList.remove('on'); setTimeout(function () { t.remove(); }, 400); }, 3600);
}

/* ============ КАЛЬКУЛЯТОР ============
   Цена = сумма выбранных услуг × коэффициент кузова.
   Пересчёт на лету при любом изменении.                        */
(function () {
  var body = document.getElementById('body'),
      opts = document.getElementById('opts'),
      sumEl = document.getElementById('sum'),
      metaEl = document.getElementById('meta'),
      listEl = document.getElementById('list'),
      toForm = document.getElementById('toForm');
  if (!body || !opts) return;

  var fmt = function (n) { return n.toLocaleString('ru-RU') + ' ₽'; };

  function calc() {
    var k = parseFloat(body.value),
        kName = body.options[body.selectedIndex].dataset.name,
        total = 0, names = [], html = '', days = 0;

    opts.querySelectorAll('input:checked').forEach(function (i) {
      var price = Math.round(parseInt(i.value, 10) * k);
      total += price;
      names.push(i.dataset.name);
      html += '<li><span>' + i.dataset.name + '</span><b style="color:var(--text)">' + fmt(price) + '</b></li>';
      days++;
    });

    // подсветка выбранных строк
    opts.querySelectorAll('.chk').forEach(function (l) {
      l.classList.toggle('on', l.querySelector('input').checked);
    });

    sumEl.textContent = fmt(total);
    listEl.innerHTML = html;

    if (!names.length) {
      metaEl.textContent = 'Выберите хотя бы одну услугу';
    } else {
      var d = Math.max(1, Math.ceil(days * 0.8));
      metaEl.textContent = kName + ' · срок ' + d + (d === 1 ? ' день' : (d < 5 ? ' дня' : ' дней'));
    }
    // запоминаем для формы
    window.__calc = { total: total, names: names, body: kName };
  }

  body.addEventListener('change', calc);
  opts.addEventListener('change', calc);

  // «Отправить заявку с расчётом» → подставляем услуги в форму
  toForm.addEventListener('click', function () {
    var c = window.__calc || {};
    var f = document.getElementById('s');
    if (c.names && c.names.length) {
      f.value = c.names.join(', ') + ' (' + c.body + ') — ' + fmt(c.total);
      toast('Расчёт перенесён в форму записи');
    } else {
      toast('Сначала выберите услуги в калькуляторе');
    }
    document.getElementById('form').scrollIntoView({ behavior: 'smooth' });
    setTimeout(function () { document.getElementById('n').focus(); }, 600);
  });

  calc();
})();

/* ============ СЛАЙДЕР «ДО / ПОСЛЕ» ============ */
(function () {
  var ba = document.getElementById('ba');
  if (!ba) return;
  var after = document.getElementById('baA'),
      before = document.getElementById('baB'),
      bar = document.getElementById('baBar'),
      cap = document.getElementById('baCap'),
      tabs = document.getElementById('baTabs');

  // наборы работ: id картинки + подпись
  var sets = [
    { id: 111,  cap: 'Audi A6 · полировка в 3 этапа + защитный воск · 1 день работ' },
    { id: 1072, cap: 'Kia Sportage · химчистка салона с озонированием · 1 день работ' },
    { id: 1063, cap: 'Mercedes E-class · керамика в 2 слоя, гарантия 3 года · 2 дня работ' },
    { id: 1076, cap: 'BMW X5 · оклейка полиуретаном, зона «антигравий» · 3 дня работ' }
  ];

  var drag = false;
  function setPos(clientX) {
    var r = ba.getBoundingClientRect();
    var p = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    after.style.clipPath = 'inset(0 0 0 ' + (p * 100) + '%)';
    bar.style.left = (p * 100) + '%';
  }
  ba.addEventListener('pointerdown', function (e) { drag = true; ba.setPointerCapture(e.pointerId); setPos(e.clientX); });
  ba.addEventListener('pointermove', function (e) { if (drag) setPos(e.clientX); });
  window.addEventListener('pointerup', function () { drag = false; });

  // переключение работ
  tabs.addEventListener('click', function (e) {
    var b = e.target.closest('.ba__tab'); if (!b) return;
    tabs.querySelectorAll('.ba__tab').forEach(function (x) { x.classList.toggle('on', x === b); });
    var s = sets[+b.dataset.i];
    before.src = 'https://picsum.photos/id/' + s.id + '/1200/750?grayscale&blur=1';
    after.src = 'https://picsum.photos/id/' + s.id + '/1200/750';
    cap.textContent = s.cap;
    setPos(ba.getBoundingClientRect().left + ba.offsetWidth / 2);
  });
})();

/* ============ ФОРМА ЗАПИСИ (валидация + имитация отправки) ============ */
(function () {
  var f = document.getElementById('lead');
  if (!f) return;
  var ok = document.getElementById('ok');

  function bad(id, on) {
    document.getElementById(id).classList.toggle('bad', on);
    document.getElementById('e-' + id).classList.toggle('on', on);
    return !on;
  }

  /* ---- реальная отправка заявки ----
     Работает по данным из CFG вверху файла:
     • LEAD_URL          → POST JSON на ваш обработчик или CRM
     • TG_TOKEN+TG_CHAT  → сообщение напрямую в Telegram-бота
     • ничего не заполнено → демо-режим (показ подтверждения без отправки) */
  function send(data) {
    if (CFG.LEAD_URL) {
      return fetch(CFG.LEAD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); });
    }
    if (CFG.TG_TOKEN && CFG.TG_CHAT) {
      var text = '🚗 Заявка с сайта ProDetail\n\n' +
        'Имя: ' + data.name + '\nТелефон: ' + data.phone +
        '\nАвто: ' + data.car + '\nУслуга: ' + (data.service || 'не указана');
      return fetch('https://api.telegram.org/bot' + CFG.TG_TOKEN + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CFG.TG_CHAT, text: text })
      }).then(function (r) { if (!r.ok) throw new Error('Telegram ' + r.status); });
    }
    return Promise.resolve();   // демо-режим
  }

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = document.getElementById('n').value.trim(),
        p = document.getElementById('p').value.trim(),
        c = document.getElementById('c').value.trim(),
        s = document.getElementById('s').value.trim();

    // телефон: +7 и 10 цифр в любом оформлении
    var digits = p.replace(/\D/g, '');
    var okN = bad('n', n.length < 2);
    var okP = bad('p', !(digits.length === 11 && /^[78]/.test(digits)));
    var okC = bad('c', c.length < 2);
    if (!(okN && okP && okC)) return;

    var btn = f.querySelector('button[type=submit]');
    var txt = btn.textContent;
    btn.disabled = true; btn.textContent = 'Отправляем…';

    send({ name: n, phone: p, car: c, service: s, page: location.href })
      .then(function () {
        f.querySelectorAll('input,button').forEach(function (el) { el.disabled = true; });
        ok.classList.add('on');
        ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toast('✓ Заявка отправлена — перезвоним в рабочее время в течение 15 минут');
        goal('lead_form');
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = txt;
        toast('Не удалось отправить. Позвоните нам: +7 (495) 123-45-67');
      });
  });

  // снимаем ошибку при вводе
  ['n', 'p', 'c'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () {
      this.classList.remove('bad');
      document.getElementById('e-' + id).classList.remove('on');
    });
  });
})();

/* ============ КАРУСЕЛЬ ОТЗЫВОВ ============ */
(function () {
  var track = document.getElementById('revTrack');
  if (!track) return;
  var n = track.children.length, i = 0,
      dots = document.getElementById('revDots');

  for (var k = 0; k < n; k++) {
    var d = document.createElement('i');
    d.dataset.i = k;
    dots.appendChild(d);
  }
  function go(x) {
    i = (x + n) % n;
    track.style.transform = 'translateX(' + (-i * 100) + '%)';
    dots.querySelectorAll('i').forEach(function (d, j) { d.classList.toggle('on', j === i); });
  }
  document.getElementById('revPrev').addEventListener('click', function () { go(i - 1); });
  document.getElementById('revNext').addEventListener('click', function () { go(i + 1); });
  dots.addEventListener('click', function (e) { if (e.target.dataset.i) go(+e.target.dataset.i); });

  // автопрокрутка, пауза при наведении
  var timer = setInterval(function () { go(i + 1); }, 6000);
  track.parentElement.addEventListener('mouseenter', function () { clearInterval(timer); });
  go(0);
})();

/* ============ STICKY CTA — показываем, когда хиро ушёл вверх ============ */
(function () {
  var bar = document.querySelector('.scta'), hero = document.querySelector('.hero');
  if (!bar || !hero || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (e) {
    bar.classList.toggle('on', !e[0].isIntersecting);
  }, { threshold: 0 }).observe(hero);
})();

/* ============ ПОЯВЛЕНИЕ БЛОКОВ ПРИ СКРОЛЛЕ ============ */
(function () {
  var els = document.querySelectorAll('.rv');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // анимацию включаем, только если её реально можно отработать
  if (reduce || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js-anim');

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(function (el, k) {
    el.style.transitionDelay = (k % 4 * 80) + 'ms';
    io.observe(el);
  });

  // страховка: если через 4 с что-то так и не показалось (нестандартный
  // скролл-контейнер, скрытая вкладка) — показываем принудительно
  setTimeout(function () {
    document.querySelectorAll('.rv:not(.on)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight * 1.5) el.classList.add('on');
    });
  }, 4000);
})();
