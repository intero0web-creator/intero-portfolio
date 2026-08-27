(function () {
  var STORAGE_KEY = 'shopping_board_v1';

  var STAGES = ['todo', 'cart', 'bought'];
  var STAGE_LABEL = { todo: 'Нужно купить', cart: 'В корзине', bought: 'Куплено' };

  var CATEGORY_ORDER = ['produce', 'dairy', 'meat', 'grocery', 'frozen', 'household', 'other'];
  var CATEGORIES = {
    produce:   { label: 'Овощи и фрукты', color: '#7CB86B', note: '#D7EFC9' },
    dairy:     { label: 'Молочное',       color: '#5B9BD5', note: '#CFE6FA' },
    meat:      { label: 'Мясо и рыба',    color: '#D9636B', note: '#FAD4D6' },
    grocery:   { label: 'Бакалея',        color: '#D4A537', note: '#FCE38A' },
    frozen:    { label: 'Заморозка',      color: '#4FB8C4', note: '#CFF1F4' },
    household: { label: 'Бытовая химия',  color: '#9A7FD1', note: '#E3D8F7' },
    other:     { label: 'Разное',         color: '#8C7A5E', note: '#EDE2C9' }
  };

  var state = {
    items: [],
    search: '',
    category: 'all'
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
  function uid() { return 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
  function fmtMoney(n) {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(n)) + ' ₽';
  }

  // ---------- filtering ----------
  function getFiltered() {
    var q = state.search.trim().toLowerCase();
    return state.items.filter(function (it) {
      if (state.category !== 'all' && it.category !== state.category) return false;
      if (q && it.name.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  // ---------- render: ticker ----------
  function renderTicker() {
    var filtered = getFiltered();
    var bought = filtered.filter(function (it) { return it.stage === 'bought'; });
    var notBought = filtered.filter(function (it) { return it.stage !== 'bought'; });
    var spent = bought.reduce(function (s, it) { return s + (it.price || 0); }, 0);
    var left = notBought.reduce(function (s, it) { return s + (it.price || 0); }, 0);

    $('#tkTotal').textContent = String(filtered.length);
    $('#tkBought').textContent = String(bought.length);
    $('#tkSpent').textContent = spent ? fmtMoney(spent) : '0 ₽';
    $('#tkLeft').textContent = left ? fmtMoney(left) : '0 ₽';
  }

  // ---------- render: category pills ----------
  function renderPills() {
    var wrap = $('#catScroll');
    var counts = { all: state.items.length };
    CATEGORY_ORDER.forEach(function (k) { counts[k] = 0; });
    state.items.forEach(function (it) { counts[it.category] = (counts[it.category] || 0) + 1; });

    var html = '<button class="cat-pill' + (state.category === 'all' ? ' active' : '') + '" data-cat="all">Все отделы</button>';
    CATEGORY_ORDER.forEach(function (key) {
      var c = CATEGORIES[key];
      var active = state.category === key ? ' active' : '';
      html += '<button class="cat-pill' + active + '" data-cat="' + key + '">' +
        '<span class="dot" style="background:' + c.color + '"></span>' + c.label + ' (' + counts[key] + ')</button>';
    });
    wrap.innerHTML = html;

    $$('.cat-pill', wrap).forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.category = btn.getAttribute('data-cat');
        renderAll();
      });
    });
  }

  // ---------- render: board columns ----------
  function noteHtml(it, stageIdx) {
    var cat = CATEGORIES[it.category] || CATEGORIES.other;
    var canBack = stageIdx > 0;
    var canForward = stageIdx < STAGES.length - 1;

    return '<div class="note stage-' + it.stage + '" style="--note-color:' + cat.note + ';--cat-color:' + cat.color + '" data-id="' + it.id + '">' +
      '<div class="note-top">' +
        '<span class="note-cat"></span>' +
        '<span class="note-name">' + escapeHtml(it.name) + '</span>' +
        '<button type="button" class="note-del" data-del="' + it.id + '" aria-label="Удалить"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg></button>' +
      '</div>' +
      (it.qty || it.price ? '<div class="note-meta">' +
        (it.qty ? '<span>' + escapeHtml(it.qty) + '</span>' : '') +
        (it.price ? '<span class="note-price">' + fmtMoney(it.price) + '</span>' : '') +
      '</div>' : '') +
      '<div class="note-actions">' +
        '<button type="button" class="note-move" data-move="' + it.id + '" data-dir="back" ' + (canBack ? '' : 'disabled') + ' aria-label="Назад: ' + (canBack ? STAGE_LABEL[STAGES[stageIdx - 1]] : '') + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
        '</button>' +
        '<button type="button" class="note-move" data-move="' + it.id + '" data-dir="forward" ' + (canForward ? '' : 'disabled') + ' aria-label="Вперёд: ' + (canForward ? STAGE_LABEL[STAGES[stageIdx + 1]] : '') + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>' +
        '</button>' +
      '</div>' +
    '</div>';
  }

  function renderBoard() {
    var filtered = getFiltered();
    var byStage = { todo: [], cart: [], bought: [] };
    filtered.forEach(function (it) { (byStage[it.stage] || byStage.todo).push(it); });

    STAGES.forEach(function (stage, idx) {
      var list = byStage[stage].slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
      var sum = list.reduce(function (s, it) { return s + (it.price || 0); }, 0);

      $('#count' + capitalize(stage)).textContent = String(list.length);
      $('#sum' + capitalize(stage)).textContent = sum ? fmtMoney(sum) : '';

      var body = $('#col' + capitalize(stage));
      if (!list.length) {
        body.innerHTML = '<div class="col-empty">Пусто</div>';
      } else {
        body.innerHTML = list.map(function (it) { return noteHtml(it, idx); }).join('');
      }
    });

    // Полный пустой экран — только когда нет вообще ни одной покупки (список действительно пуст).
    // Если фильтр просто ничего не нашёл, колонки сами покажут «Пусто» — доска не пропадает целиком.
    $('#emptyAll').style.display = state.items.length ? 'none' : '';
    $('#board').style.display = state.items.length ? '' : 'none';

    $$('.note-move:not([disabled])', $('#board')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-move');
        var dir = btn.getAttribute('data-dir');
        var item = state.items.find(function (it) { return it.id === id; });
        if (!item) return;
        var idx = STAGES.indexOf(item.stage);
        var nextIdx = dir === 'forward' ? idx + 1 : idx - 1;
        if (nextIdx < 0 || nextIdx >= STAGES.length) return;
        item.stage = STAGES[nextIdx];
        save();
        renderAll();
      });
    });

    $$('.note-del', $('#board')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-del');
        state.items = state.items.filter(function (it) { return it.id !== id; });
        save();
        renderAll();
      });
    });
  }

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function renderAll() {
    renderTicker();
    renderPills();
    renderBoard();
  }

  // ---------- events ----------
  function initQuickAdd() {
    var form = $('#quickAddForm');
    var moreBtn = $('#quickAddMore');
    var extra = $('#quickAddExtra');

    moreBtn.addEventListener('click', function () {
      var open = extra.classList.toggle('open');
      moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) $('#fQty').focus();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nameInput = $('#fName');
      var name = nameInput.value.trim();
      if (!name) { nameInput.focus(); return; }

      state.items.push({
        id: uid(),
        name: name,
        category: $('#fCategory').value,
        qty: $('#fQty').value.trim(),
        price: parseFloat($('#fPrice').value) || 0,
        stage: 'todo',
        createdAt: Date.now()
      });
      save();
      form.reset();
      nameInput.focus();
      renderAll();
    });
  }

  function initSearch() {
    $('#search').addEventListener('input', function () {
      state.search = this.value;
      renderTicker();
      renderBoard();
    });
  }

  function initCategorySelect() {
    var sel = $('#fCategory');
    sel.innerHTML = CATEGORY_ORDER.map(function (key) {
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
    [initCategorySelect, initQuickAdd, initSearch, renderAll].forEach(function (fn) {
      try { fn(); } catch (e) { console.error('[ShoppingList] ошибка в ' + fn.name + ':', e); }
    });
  });
})();
