(function () {
  var STORAGE_KEY = 'expenses_v1';

  var CATEGORIES = {
    food:    { label: 'Еда',         color: '#F0546B' },
    transport:{ label: 'Транспорт',  color: '#6C8CFF' },
    home:    { label: 'Жильё',       color: '#3DD68C' },
    fun:     { label: 'Развлечения', color: '#F0B44B' },
    health:  { label: 'Здоровье',    color: '#B36CFF' },
    shop:    { label: 'Покупки',     color: '#4BC6F0' },
    other:   { label: 'Другое',      color: '#9AA0AC' }
  };

  var state = {
    items: [],
    search: '',
    category: 'all',
    period: 'all' // all | today | week | month
  };

  // ---------- localStorage ----------
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Не удалось прочитать localStorage:', e);
      return [];
    }
  }
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch (e) {
      console.error('Не удалось сохранить в localStorage:', e);
    }
  }

  // ---------- utils ----------
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function uid() { return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function fmtMoney(n) {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(n)) + ' ₽';
  }
  function todayISO() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  function fmtDate(iso) {
    var d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  }
  function startOfWeek(d) {
    var day = d.getDay() || 7;
    var res = new Date(d);
    res.setDate(d.getDate() - day + 1);
    res.setHours(0, 0, 0, 0);
    return res;
  }

  // ---------- filtering ----------
  function inPeriod(iso) {
    if (state.period === 'all') return true;
    var itemDate = new Date(iso + 'T00:00:00');
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    if (state.period === 'today') {
      return iso === todayISO();
    }
    if (state.period === 'week') {
      return itemDate >= startOfWeek(now);
    }
    if (state.period === 'month') {
      return itemDate.getFullYear() === now.getFullYear() && itemDate.getMonth() === now.getMonth();
    }
    return true;
  }

  function getFiltered() {
    var q = state.search.trim().toLowerCase();
    return state.items.filter(function (it) {
      if (state.category !== 'all' && it.category !== state.category) return false;
      if (!inPeriod(it.date)) return false;
      if (q && it.note.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  // ---------- render ----------
  function renderStats() {
    var filtered = getFiltered();
    var total = filtered.reduce(function (s, it) { return s + it.amount; }, 0);
    var count = filtered.length;
    var avg = count ? total / count : 0;

    var byCat = {};
    filtered.forEach(function (it) {
      byCat[it.category] = (byCat[it.category] || 0) + it.amount;
    });
    var topCat = null, topVal = 0;
    Object.keys(byCat).forEach(function (c) {
      if (byCat[c] > topVal) { topVal = byCat[c]; topCat = c; }
    });

    $('#statTotal').textContent = fmtMoney(total);
    $('#statCount').textContent = String(count);
    $('#statAvg').textContent = count ? fmtMoney(avg) : '—';
    $('#statTop').textContent = topCat ? CATEGORIES[topCat].label : '—';
  }

  function renderChips() {
    var wrap = $('#chips');
    var html = '<button class="chip' + (state.category === 'all' ? ' active' : '') + '" data-cat="all">Все категории</button>';
    Object.keys(CATEGORIES).forEach(function (key) {
      var c = CATEGORIES[key];
      var active = state.category === key ? ' active' : '';
      html += '<button class="chip' + active + '" data-cat="' + key + '" style="color:' + (state.category === key ? c.color : '') + '">' +
        '<span class="dot" style="background:' + c.color + '"></span>' + c.label + '</button>';
    });
    wrap.innerHTML = html;
    $$('.chip', wrap).forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.category = btn.getAttribute('data-cat');
        renderAll();
      });
    });
  }

  function renderList() {
    var listEl = $('#list');
    var emptyEl = $('#empty');
    var filtered = getFiltered().slice().sort(function (a, b) {
      return b.date === a.date ? b.createdAt - a.createdAt : (b.date > a.date ? 1 : -1);
    });

    if (!filtered.length) {
      listEl.innerHTML = '';
      emptyEl.style.display = '';
      emptyEl.querySelector('p').textContent = state.items.length
        ? 'Ничего не найдено — попробуйте другой фильтр или запрос.'
        : 'Записей пока нет. Добавьте первый расход выше.';
      return;
    }
    emptyEl.style.display = 'none';

    listEl.innerHTML = filtered.map(function (it) {
      var cat = CATEGORIES[it.category] || CATEGORIES.other;
      var note = it.note ? escapeHtml(it.note) : cat.label;
      return (
        '<div class="item" data-id="' + it.id + '">' +
          '<span class="item-dot" style="background:' + cat.color + '"></span>' +
          '<div class="item-main">' +
            '<div class="item-note">' + note + '</div>' +
            '<div class="item-meta"><span class="item-cat">' + cat.label + '</span><span>·</span><span>' + fmtDate(it.date) + '</span></div>' +
          '</div>' +
          '<div class="item-amount">' + fmtMoney(it.amount) + '</div>' +
          '<button class="item-del" data-del="' + it.id + '" aria-label="Удалить">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>' +
          '</button>' +
        '</div>'
      );
    }).join('');

    $$('.item-del', listEl).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-del');
        state.items = state.items.filter(function (it) { return it.id !== id; });
        save();
        renderAll();
      });
    });
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function renderAll() {
    renderStats();
    renderChips();
    renderList();
  }

  // ---------- events ----------
  function initForm() {
    var form = $('#addForm');
    var dateInput = $('#fDate');
    dateInput.value = todayISO();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var amount = parseFloat($('#fAmount').value);
      if (!amount || amount <= 0) {
        $('#fAmount').focus();
        return;
      }
      var item = {
        id: uid(),
        amount: amount,
        category: $('#fCategory').value,
        note: $('#fNote').value.trim(),
        date: dateInput.value || todayISO(),
        createdAt: Date.now()
      };
      state.items.push(item);
      save();
      form.reset();
      dateInput.value = todayISO();
      $('#fAmount').focus();
      renderAll();
    });
  }

  function initFilters() {
    $('#search').addEventListener('input', function () {
      state.search = this.value;
      renderList();
      renderStats();
    });

    $$('.period-toggle button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('.period-toggle button').forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        state.period = btn.getAttribute('data-period');
        renderAll();
      });
    });
  }

  // ---------- export ----------
  function csvEscape(v) {
    var s = String(v == null ? '' : v);
    if (/[",\n;]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  function buildCSV(items) {
    var rows = [['Дата', 'Сумма', 'Категория', 'Заметка']];
    items.forEach(function (it) {
      var cat = CATEGORIES[it.category] ? CATEGORIES[it.category].label : it.category;
      rows.push([it.date, it.amount, cat, it.note || '']);
    });
    // BOM — чтобы Excel корректно определил UTF-8
    return '﻿' + rows.map(function (r) { return r.map(csvEscape).join(';'); }).join('\r\n');
  }

  function downloadFile(content, mime, filename) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function initExport() {
    var btn = $('#exportBtn');
    var formatSel = $('#exportFormat');
    if (!btn || !formatSel) return;

    btn.addEventListener('click', function () {
      if (!state.items.length) return;
      var stamp = todayISO();
      var format = formatSel.value;

      if (format === 'json') {
        downloadFile(JSON.stringify(state.items, null, 2), 'application/json', 'expenses_' + stamp + '.json');
      } else {
        downloadFile(buildCSV(state.items), 'text/csv;charset=utf-8', 'expenses_' + stamp + '.csv');
      }
    });
  }

  function initCategorySelect() {
    var sel = $('#fCategory');
    sel.innerHTML = Object.keys(CATEGORIES).map(function (key) {
      return '<option value="' + key + '">' + CATEGORIES[key].label + '</option>';
    }).join('');
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    // Каждый модуль изолирован — если один упадёт, остальные всё равно запустятся.
    state.items = load();
    [initCategorySelect, initForm, initFilters, initExport, renderAll].forEach(function (fn) {
      try { fn(); } catch (e) { console.error('[ExpenseTracker] ошибка в ' + fn.name + ':', e); }
    });
  });
})();
