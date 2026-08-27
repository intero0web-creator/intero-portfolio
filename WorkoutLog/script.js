(function () {
  var STORAGE_KEY = 'workouts_v1';

  var CATEGORIES = {
    chest:     { label: 'Грудь',    color: '#FB7185' },
    back:      { label: 'Спина',    color: '#60A5FA' },
    legs:      { label: 'Ноги',     color: '#34D399' },
    shoulders: { label: 'Плечи',    color: '#FBBF24' },
    arms:      { label: 'Руки',     color: '#A78BFA' },
    core:      { label: 'Кор',      color: '#FB923C' }
  };

  var WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

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
  function uid() { return 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function toISO(d) {
    var x = new Date(d);
    x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
    return x.toISOString().slice(0, 10);
  }
  function todayISO() { return toISO(new Date()); }

  function volumeOf(it) { return it.weight * it.reps * it.sets; }

  function fmtNum(n) {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(n));
  }

  function fmtDateHeading(iso) {
    var d = new Date(iso + 'T00:00:00');
    var today = todayISO();
    var yesterday = toISO(new Date(Date.now() - 86400000));
    var base = d.getDate() + ' ' + MONTHS[d.getMonth()];
    var rel = iso === today ? 'сегодня' : iso === yesterday ? 'вчера' : WEEKDAYS[d.getDay()];
    return { base: base, rel: rel };
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // ---------- period filtering ----------
  function startOfWeek(d) {
    var day = d.getDay() || 7;
    var res = new Date(d);
    res.setDate(d.getDate() - day + 1);
    res.setHours(0, 0, 0, 0);
    return res;
  }
  function inPeriod(iso) {
    if (state.period === 'all') return true;
    var d = new Date(iso + 'T00:00:00');
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    if (state.period === 'today') return iso === todayISO();
    if (state.period === 'week') return d >= startOfWeek(now);
    if (state.period === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    return true;
  }

  function getFiltered() {
    var q = state.search.trim().toLowerCase();
    return state.items.filter(function (it) {
      if (state.category !== 'all' && it.category !== state.category) return false;
      if (!inPeriod(it.date)) return false;
      if (q && it.name.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  // ---------- render: stats ----------
  function renderStats() {
    var filtered = getFiltered();
    var uniqueDates = {};
    var totalSets = 0, totalVolume = 0;

    // Личный рекорд считаем отдельно по каждому упражнению (it.name), а не глобальным
    // максимумом по всей истории — иначе одна тяжёлая становая навсегда «забивает»
    // прогресс в жиме и любых других движениях.
    var maxByExercise = {}; // ключ — имя упражнения в нижнем регистре → запись с макс. весом

    filtered.forEach(function (it) {
      uniqueDates[it.date] = true;
      totalSets += it.sets;
      totalVolume += volumeOf(it);

      var key = it.name.trim().toLowerCase();
      var current = maxByExercise[key];
      if (!current || it.weight > current.weight ||
          (it.weight === current.weight && it.date > current.date)) {
        maxByExercise[key] = it;
      }
    });

    // На карточке показываем не абсолютно самый тяжёлый вес во всей истории,
    // а последний по дате личный рекорд — то есть самое недавнее реальное улучшение.
    var pr = null;
    Object.keys(maxByExercise).forEach(function (key) {
      var candidate = maxByExercise[key];
      if (!pr || candidate.date > pr.date ||
          (candidate.date === pr.date && candidate.createdAt > pr.createdAt)) {
        pr = candidate;
      }
    });

    $('#statWorkouts').textContent = String(Object.keys(uniqueDates).length);
    $('#statSets').textContent = String(totalSets);
    $('#statVolume').textContent = totalVolume ? fmtNum(totalVolume) + ' кг' : '—';
    $('#statPR').textContent = pr ? fmtNum(pr.weight) + ' кг' : '—';
    $('#statPRName').textContent = pr ? pr.name : 'Пока нет данных';
  }

  // ---------- render: 7-day bar chart (пересчитывается от реальных данных, без фильтров) ----------
  function renderChart() {
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var days = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date(now);
      d.setDate(now.getDate() - i);
      days.push(d);
    }
    var todayIso = todayISO();

    var perDay = days.map(function (d) {
      var iso = toISO(d);
      var vol = state.items
        .filter(function (it) { return it.date === iso; })
        .reduce(function (s, it) { return s + volumeOf(it); }, 0);
      return { iso: iso, day: d, vol: vol };
    });

    var max = perDay.reduce(function (m, p) { return Math.max(m, p.vol); }, 0);
    var weekTotal = perDay.reduce(function (s, p) { return s + p.vol; }, 0);

    $('#chartTotal').textContent = weekTotal ? fmtNum(weekTotal) + ' кг' : 'нет данных';

    $('#bars').innerHTML = perDay.map(function (p) {
      var h = max ? clamp((p.vol / max) * 100, p.vol > 0 ? 6 : 0, 100) : 0;
      return '<div class="bar-col' + (p.iso === todayIso ? ' today' : '') + '">' +
        '<div class="bar-track"><div class="bar-fill" style="height:' + h + '%" title="' + fmtNum(p.vol) + ' кг"></div></div>' +
        '<div class="bar-day">' + WEEKDAYS[p.day.getDay()] + '</div>' +
      '</div>';
    }).join('');
  }

  // ---------- render: chips ----------
  function renderChips() {
    var wrap = $('#chips');
    var html = '<button class="chip' + (state.category === 'all' ? ' active' : '') + '" data-cat="all">Все группы</button>';
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

  // ---------- render: timeline ----------
  function renderTimeline() {
    var listEl = $('#timeline');
    var emptyEl = $('#empty');
    var filtered = getFiltered();

    if (!filtered.length) {
      listEl.innerHTML = '';
      emptyEl.style.display = '';
      emptyEl.querySelector('p').textContent = state.items.length
        ? 'Ничего не найдено — попробуйте другой фильтр или запрос.'
        : 'Записей пока нет. Добавьте первую тренировку выше.';
      return;
    }
    emptyEl.style.display = 'none';

    // Группировка по дате, даты по убыванию, записи внутри дня — по времени добавления
    var byDate = {};
    filtered.forEach(function (it) {
      (byDate[it.date] = byDate[it.date] || []).push(it);
    });
    var dates = Object.keys(byDate).sort(function (a, b) { return b < a ? -1 : 1; });

    listEl.innerHTML = dates.map(function (iso) {
      var entries = byDate[iso].sort(function (a, b) { return b.createdAt - a.createdAt; });
      var heading = fmtDateHeading(iso);

      var entriesHtml = entries.map(function (it) {
        var cat = CATEGORIES[it.category] || CATEGORIES.chest;
        var vol = volumeOf(it);
        return '<div class="entry" data-id="' + it.id + '">' +
          '<span class="entry-dot" style="background:' + cat.color + '"></span>' +
          '<div class="entry-main">' +
            '<div class="entry-name">' + escapeHtml(it.name) + '</div>' +
            '<div class="entry-meta">' + cat.label + ' · ' + it.weight + ' кг × ' + it.reps + ' × ' + it.sets + ' подх.</div>' +
          '</div>' +
          '<div class="entry-vol">' + fmtNum(vol) + ' кг</div>' +
          '<button type="button" class="entry-del" data-del="' + it.id + '" aria-label="Удалить запись">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>' +
          '</button>' +
        '</div>';
      }).join('');

      return '<div class="tl-group">' +
        '<div class="tl-dot"></div>' +
        '<div class="tl-date">' + heading.base + '<span class="rel">' + heading.rel + '</span></div>' +
        entriesHtml +
      '</div>';
    }).join('');

    $$('.entry-del', listEl).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-del');
        var item = state.items.find(function (it) { return it.id === id; });
        if (!item) return;
        var ok = window.confirm('Удалить эту запись?\nЭто действие нельзя отменить.');
        if (!ok) return;
        state.items = state.items.filter(function (it) { return it.id !== id; });
        save();
        renderAll();
      });
    });
  }

  function renderAll() {
    renderStats();
    renderChart();
    renderChips();
    renderTimeline();
  }

  // ---------- events ----------
  function initForm() {
    var form = $('#addForm');
    var dateInput = $('#fDate');
    dateInput.value = todayISO();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#fName').value.trim();
      var weight = parseFloat($('#fWeight').value) || 0;
      var reps = parseInt($('#fReps').value, 10) || 0;
      var sets = parseInt($('#fSets').value, 10) || 0;

      if (!name) { $('#fName').focus(); return; }
      if (!reps || !sets) { $('#fReps').focus(); return; }

      state.items.push({
        id: uid(),
        name: name,
        category: $('#fCategory').value,
        weight: weight,
        reps: reps,
        sets: sets,
        date: dateInput.value || todayISO(),
        createdAt: Date.now()
      });
      save();
      form.reset();
      dateInput.value = todayISO();
      $('#fName').focus();
      renderAll();
    });
  }

  function initFilters() {
    $('#search').addEventListener('input', function () {
      state.search = this.value;
      renderStats();
      renderTimeline();
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
        renderStats();
        renderTimeline();
      });
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
    [initCategorySelect, initForm, initFilters, renderAll].forEach(function (fn) {
      try { fn(); } catch (e) { console.error('[WorkoutLog] ошибка в ' + fn.name + ':', e); }
    });
  });
})();
