(function () {
  var STORAGE_KEY = 'habits_v1';
  var RING_CIRC = 2 * Math.PI * 52; // 326.7

  var CATEGORIES = {
    health:   { label: 'Здоровье',   color: '#34D399' },
    study:    { label: 'Учёба',      color: '#60A5FA' },
    work:     { label: 'Работа',     color: '#F59E0B' },
    creative: { label: 'Творчество', color: '#F472B6' },
    sport:    { label: 'Спорт',      color: '#FB923C' },
    other:    { label: 'Другое',     color: '#9AA0AC' }
  };

  var DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  var MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

  var state = {
    habits: [],
    search: '',
    category: 'all',
    weekOffset: 0 // 0 = текущая неделя, отрицательные — прошлые
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.habits));
    } catch (e) {
      console.error('Не удалось сохранить в localStorage:', e);
    }
  }

  // ---------- utils ----------
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function uid() { return 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function toISO(d) {
    var x = new Date(d);
    x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
    return x.toISOString().slice(0, 10);
  }
  function todayISO() { return toISO(new Date()); }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // Понедельник недели со смещением offset (0 = текущая неделя)
  function getWeekDays(offset) {
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var dow = now.getDay() || 7; // 1..7, Пн..Вс
    var monday = new Date(now);
    monday.setDate(now.getDate() - dow + 1 + offset * 7);
    var days = [];
    for (var i = 0; i < 7; i++) {
      var d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }

  // ---------- streak / stats helpers (всегда от реального «сегодня») ----------
  function currentStreak(habit) {
    var streak = 0;
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    if (!habit.log[toISO(d)]) d.setDate(d.getDate() - 1);
    while (habit.log[toISO(d)]) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  function last7Rate(habit) {
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var done = 0;
    for (var i = 0; i < 7; i++) {
      var d = new Date(now);
      d.setDate(now.getDate() - i);
      if (habit.log[toISO(d)]) done++;
    }
    return done / 7;
  }

  // ---------- filtering ----------
  function getFiltered() {
    var q = state.search.trim().toLowerCase();
    return state.habits.filter(function (h) {
      if (state.category !== 'all' && h.category !== state.category) return false;
      if (q && h.name.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  // ---------- render: sidebar ----------
  function renderRing() {
    var filtered = getFiltered();
    var todayIso = todayISO();
    var total = filtered.length;
    var done = filtered.filter(function (h) { return h.log[todayIso]; }).length;
    var pct = total ? done / total : 0;

    var offset = RING_CIRC * (1 - pct);
    $('#ringVal').style.strokeDashoffset = String(offset);
    $('#ringPct').textContent = Math.round(pct * 100) + '%';
    $('#ringFrac').textContent = done + ' / ' + total;
  }

  function renderSideStats() {
    var filtered = getFiltered();
    var bestStreak = filtered.reduce(function (max, h) { return Math.max(max, currentStreak(h)); }, 0);
    var avgRate = filtered.length
      ? filtered.reduce(function (s, h) { return s + last7Rate(h); }, 0) / filtered.length
      : 0;

    $('#statStreak').textContent = bestStreak ? (bestStreak + ' дн.') : '—';
    $('#statRate').textContent = filtered.length ? Math.round(avgRate * 100) + '%' : '—';
    $('#statTotal').textContent = String(state.habits.length);
  }

  function renderCatNav() {
    var nav = $('#catNav');
    var counts = { all: state.habits.length };
    Object.keys(CATEGORIES).forEach(function (k) { counts[k] = 0; });
    state.habits.forEach(function (h) { counts[h.category] = (counts[h.category] || 0) + 1; });

    var html = '<div class="cat-nav-title">Категории</div>';
    html += '<button type="button" class="cat-item' + (state.category === 'all' ? ' active' : '') + '" data-cat="all">' +
      '<span class="cat-dot" style="background:var(--text-dim-2)"></span>' +
      '<span class="name">Все</span><span class="count">' + counts.all + '</span></button>';

    Object.keys(CATEGORIES).forEach(function (key) {
      var c = CATEGORIES[key];
      var active = state.category === key ? ' active' : '';
      html += '<button type="button" class="cat-item' + active + '" data-cat="' + key + '">' +
        '<span class="cat-dot" style="background:' + c.color + '"></span>' +
        '<span class="name">' + c.label + '</span><span class="count">' + counts[key] + '</span></button>';
    });
    nav.innerHTML = html;

    $$('.cat-item', nav).forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.category = btn.getAttribute('data-cat');
        renderAll();
      });
    });
  }

  // ---------- render: main / matrix ----------
  function renderWeekNav(days) {
    var first = days[0], last = days[6];
    var sameMonth = first.getMonth() === last.getMonth();
    var range = first.getDate() + (sameMonth ? '' : ' ' + MONTHS_SHORT[first.getMonth()]) +
      '–' + last.getDate() + ' ' + MONTHS_SHORT[last.getMonth()];
    $('#weekRange').textContent = range;
    $('#weekToday').disabled = state.weekOffset === 0;
  }

  function renderMatrix() {
    var days = getWeekDays(state.weekOffset);
    renderWeekNav(days);

    var todayIso = todayISO();
    var head = $('#matrixHead');
    head.innerHTML = '<div class="mg-th th-name">Привычка</div>' +
      days.map(function (d) {
        var iso = toISO(d);
        return '<div class="mg-th' + (iso === todayIso ? ' th-today' : '') + '">' + DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1] + '<br>' + d.getDate() + '</div>';
      }).join('') +
      '<div class="mg-th th-meta">Серия</div>';

    var filtered = getFiltered().slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
    var body = $('#matrixBody');
    var wrap = $('#matrixTable');
    var empty = $('#empty');

    if (!filtered.length) {
      body.innerHTML = '';
      wrap.style.display = 'none';
      empty.style.display = '';
      empty.querySelector('p').textContent = state.habits.length
        ? 'Ничего не найдено — попробуйте другой фильтр или запрос.'
        : 'Привычек пока нет. Добавьте первую слева.';
      return;
    }
    wrap.style.display = '';
    empty.style.display = 'none';

    body.innerHTML = filtered.map(function (h) {
      var cat = CATEGORIES[h.category] || CATEGORIES.other;
      var streak = currentStreak(h);

      var cellsHtml = days.map(function (d) {
        var iso = toISO(d);
        var isToday = iso === todayIso;
        var isDone = !!h.log[iso];
        var dLabel = DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1] + ' ' + d.getDate();
        return '<div class="mg-td"><button type="button" class="cell-btn' + (isDone ? ' done' : '') + (isToday ? ' today' : '') +
          '" data-habit="' + h.id + '" data-date="' + iso + '" style="--cell-color:' + cat.color + '" ' +
          'aria-pressed="' + (isDone ? 'true' : 'false') + '" aria-label="' + dLabel + (isDone ? ', выполнено' : ', не выполнено') + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
          '</button></div>';
      }).join('');

      return '<div class="mg-row" data-id="' + h.id + '">' +
        '<div class="m-name">' +
          '<span class="m-dot" style="background:' + cat.color + '"></span>' +
          '<span class="m-name-text">' + escapeHtml(h.name) + '</span>' +
          '<button type="button" class="m-del" data-del="' + h.id + '" aria-label="Удалить привычку">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>' +
          '</button>' +
        '</div>' +
        cellsHtml +
        '<div class="m-meta"><span class="m-streak' + (streak ? '' : ' zero') + '">' + (streak ? '🔥 ' + streak : '—') + '</span></div>' +
      '</div>';
    }).join('');

    $$('.cell-btn', body).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var habitId = btn.getAttribute('data-habit');
        var date = btn.getAttribute('data-date');
        var habit = state.habits.find(function (h) { return h.id === habitId; });
        if (!habit) return;
        if (habit.log[date]) delete habit.log[date];
        else habit.log[date] = true;
        save();
        renderAll();
      });
    });

    $$('.m-del', body).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-del');
        var habit = state.habits.find(function (h) { return h.id === id; });
        if (!habit) return;
        var ok = window.confirm('Удалить эту привычку?\nВся история отметок по ней будет потеряна.');
        if (!ok) return;
        state.habits = state.habits.filter(function (h) { return h.id !== id; });
        save();
        renderAll();
      });
    });
  }

  function renderAll() {
    renderRing();
    renderSideStats();
    renderCatNav();
    renderMatrix();
  }

  // ---------- events ----------
  function initAddPanel() {
    var toggle = $('#addToggle');
    var panel = $('#addForm');
    var cancel = $('#addCancel');
    var nameInput = $('#fName');

    toggle.addEventListener('click', function () {
      panel.classList.add('open');
      toggle.style.display = 'none';
      nameInput.focus();
    });
    cancel.addEventListener('click', function () {
      panel.classList.remove('open');
      toggle.style.display = '';
      panel.reset();
    });
    panel.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = nameInput.value.trim();
      if (!name) { nameInput.focus(); return; }

      state.habits.push({
        id: uid(),
        name: name,
        category: $('#fCategory').value,
        log: {},
        createdAt: Date.now()
      });
      save();
      panel.reset();
      panel.classList.remove('open');
      toggle.style.display = '';
      renderAll();
    });
  }

  function initWeekNav() {
    $('#weekPrev').addEventListener('click', function () {
      state.weekOffset -= 1;
      renderMatrix();
    });
    $('#weekNext').addEventListener('click', function () {
      state.weekOffset = clamp(state.weekOffset + 1, -999, 999);
      renderMatrix();
    });
    $('#weekToday').addEventListener('click', function () {
      state.weekOffset = 0;
      renderMatrix();
    });
  }

  function initSearch() {
    $('#search').addEventListener('input', function () {
      state.search = this.value;
      renderRing();
      renderSideStats();
      renderMatrix();
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
    state.habits = load();
    state.habits.forEach(function (h) { if (!h.log) h.log = {}; });
    [initCategorySelect, initAddPanel, initWeekNav, initSearch, renderAll].forEach(function (fn) {
      try { fn(); } catch (e) { console.error('[HabitTracker] ошибка в ' + fn.name + ':', e); }
    });
  });
})();
