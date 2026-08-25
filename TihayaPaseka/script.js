// Тихая пасека — клиентский скрипт.
// Задачи: мобильное меню, подстановка контактов из CFG, отправка форм.

(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  // ---- Мобильное меню ----
  function initNav() {
    var header = $('.site-header');
    var toggle = $('.nav-toggle');
    if (!header || !toggle) return;
    toggle.addEventListener('click', function () { header.classList.toggle('nav-open'); });
    $$('.nav a', header).forEach(function (a) {
      a.addEventListener('click', function () { header.classList.remove('nav-open'); });
    });
  }

  // ---- Подстановка контактов из CFG ----
  function applyConfig() {
    var C = window.CFG || {};

    $$('[data-cfg]').forEach(function (el) {
      var key = el.getAttribute('data-cfg');
      var val = C[key];
      var optional = el.closest('[data-cfg-optional]');

      if (val == null || val === '') {
        if (optional) optional.style.display = 'none';
        else el.style.display = 'none';
        return;
      }

      // Не затираем текст, если у элемента явно проставлен data-cfg-text-keep
      if (!el.hasAttribute('data-cfg-text-keep')) el.textContent = val;

      var hrefType = el.getAttribute('data-cfg-href');
      if (hrefType === 'mailto') el.setAttribute('href', 'mailto:' + val);
      else if (hrefType === 'tel') el.setAttribute('href', 'tel:' + (C.phoneRaw || val).replace(/[^\d+]/g, ''));
      else if (hrefType === 'tg')  el.setAttribute('href', C.telegramUrl || ('https://t.me/' + String(val).replace('@', '')));
      else if (hrefType === 'vk')  el.setAttribute('href', C.vkUrl || '#');
    });

    // Индикатор демо-режима — показываем, только если реальный канал не настроен
    var isDemo = C.DEMO && !C.LEAD_URL && !(C.TG_TOKEN && C.TG_CHAT);
    $$('[data-cfg-demo]').forEach(function (el) {
      el.style.display = isDemo ? '' : 'none';
    });
  }

  // ---- Отправка формы ----
  function submitForm(form) {
    var C = window.CFG || {};
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });

    var msgEl = form.querySelector('.form-msg');
    if (!msgEl) {
      msgEl = document.createElement('div');
      msgEl.className = 'form-msg';
      form.appendChild(msgEl);
    }

    var btn = form.querySelector('button[type=submit]');
    if (btn && !btn.dataset.textInitial) btn.dataset.textInitial = btn.textContent;

    function setState(state, text) {
      msgEl.className = 'form-msg ' + (state || '');
      msgEl.textContent = text || '';
      if (btn) {
        btn.disabled = state === 'loading';
        btn.textContent = state === 'loading' ? 'Отправляем…' : btn.dataset.textInitial;
      }
    }

    setState('loading', 'Отправляем…');

    var source = form.getAttribute('data-source') || 'Сообщение с сайта';
    var brand  = C.brand || 'Тихая пасека';
    var msgText = '📮 ' + source + ' — ' + brand;
    Object.keys(data).forEach(function (k) { msgText += '\n' + k + ': ' + data[k]; });

    function onSuccess(demo) {
      form.reset();
      setState('ok', demo
        ? 'Заявка принята! (Демо-режим — реального сообщения не отправлено.)'
        : 'Спасибо! Мы получили заявку и свяжемся с вами в течение суток.');
    }
    function onFail(reason) {
      var mail = C.email ? (' на ' + C.email) : '';
      setState('err', 'Не удалось отправить: ' + (reason || 'ошибка сети') + '. Напишите нам напрямую' + mail + '.');
    }

    // Приоритет: LEAD_URL → Telegram → DEMO
    if (C.LEAD_URL) {
      var payload = Object.assign({ _subject: source + ' — ' + brand, _source: source }, data);
      fetch(C.LEAD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) { r.ok ? onSuccess(false) : onFail('код ' + r.status); })
        .catch(function () { onFail('сеть'); });

    } else if (C.TG_TOKEN && C.TG_CHAT) {
      fetch('https://api.telegram.org/bot' + C.TG_TOKEN + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: C.TG_CHAT, text: msgText, disable_web_page_preview: true })
      }).then(function (r) { r.ok ? onSuccess(false) : onFail('Telegram ' + r.status); })
        .catch(function () { onFail('сеть'); });

    } else if (C.DEMO) {
      console.info('[Тихая пасека · демо-отправка]', { source: source, data: data });
      setTimeout(function () { onSuccess(true); }, 650);

    } else {
      onFail('канал не настроен');
    }
  }

  function initForms() {
    $$('form[data-form]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        // Валидация даты визита — только суббота, если поле есть
        var dateInput = form.querySelector('input[type=date][data-only-saturday]');
        if (dateInput && dateInput.value) {
          var d = new Date(dateInput.value + 'T00:00:00');
          if (d.getDay() !== 6) {
            dateInput.setCustomValidity('Мы принимаем гостей только по субботам. Выберите ближайшую субботу.');
            dateInput.reportValidity();
            dateInput.addEventListener('input', function once() {
              dateInput.setCustomValidity('');
              dateInput.removeEventListener('input', once);
            });
            return;
          }
        }
        submitForm(form);
      });
    });
  }

  // ---- Фильтр каталога (shop.html) ----
  function initShopFilter() {
    var chips = $$('#shopFilter .chip[data-filter]');
    var cards = $$('#shopGrid .product-card[data-category]');
    if (!chips.length || !cards.length) return;

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var filter = chip.getAttribute('data-filter');
        chips.forEach(function (c) { c.classList.toggle('active', c === chip); });
        var shown = 0;
        cards.forEach(function (card) {
          var match = filter === 'all' || card.getAttribute('data-category') === filter;
          card.style.display = match ? '' : 'none';
          if (match) shown++;
        });

        var empty = $('#shopEmpty');
        if (empty) empty.style.display = shown === 0 ? '' : 'none';
      });
    });
  }

  ready(function () {
    // Каждый модуль изолирован — если один упадёт, остальные всё равно запустятся.
    [applyConfig, initNav, initForms, initShopFilter].forEach(function (fn) {
      try { fn(); } catch (e) { console.error('[Тихая пасека] ошибка в ' + fn.name + ':', e); }
    });
  });
})();
