(function () {
  var STORAGE_KEY = 'task_matrix_v1';

  var QUADRANTS = {
    do:        { label: 'Сделать сейчас', hint: 'Срочно и важно',        color: 'var(--do)',        bg: 'var(--do-bg)' },
    schedule:  { label: 'Запланировать',  hint: 'Важно, не срочно',      color: 'var(--schedule)',  bg: 'var(--schedule-bg)' },
    delegate:  { label: 'Делегировать',   hint: 'Срочно, не важно',      color: 'var(--delegate)',  bg: 'var(--delegate-bg)' },
    eliminate: { label: 'Исключить',      hint: 'Не срочно и не важно',  color: 'var(--eliminate)', bg: 'var(--eliminate-bg)' }
  };
  var QUAD_ORDER = ['do', 'schedule', 'delegate', 'eliminate'];

  var state = {
    tasks: [],
    search: '',
    showDone: false,
    addUrgent: false,
    addImportant: false
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
    } catch (e) {
      console.error('Не удалось сохранить в localStorage:', e);
    }
  }

  // ---------- utils ----------
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function uid() { return 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
  function quadrantOf(t) {
    if (t.urgent && t.important) return 'do';
    if (!t.urgent && t.important) return 'schedule';
    if (t.urgent && !t.important) return 'delegate';
    return 'eliminate';
  }

  // ---------- filtering ----------
  function getFiltered() {
    var q = state.search.trim().toLowerCase();
    return state.tasks.filter(function (t) {
      if (q && t.text.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  // ---------- render: summary ----------
  function renderSummary() {
    var filtered = getFiltered();
    var done = filtered.filter(function (t) { return t.done; }).length;
    var total = filtered.length;
    var rate = total ? Math.round((done / total) * 100) : 0;

    $('#sumTotal').textContent = String(total);
    $('#sumDone').textContent = String(done);
    $('#ratePct').textContent = rate + '%';
    $('#rateFill').style.width = rate + '%';
  }

  // ---------- render: matrix ----------
  function renderMatrix() {
    var filtered = getFiltered();
    var byQuad = { do: [], schedule: [], delegate: [], eliminate: [] };
    filtered.forEach(function (t) {
      if (!state.showDone && t.done) return;
      byQuad[quadrantOf(t)].push(t);
    });

    QUAD_ORDER.forEach(function (key) {
      var list = byQuad[key].slice().sort(function (a, b) {
        if (a.done !== b.done) return a.done ? 1 : -1;
        return b.createdAt - a.createdAt;
      });
      var totalInQuad = filtered.filter(function (t) { return quadrantOf(t) === key; }).length;

      $('#count-' + key).textContent = String(totalInQuad);

      var body = $('#body-' + key);
      if (!list.length) {
        body.innerHTML = '<div class="quad-empty">' +
          (totalInQuad ? 'Всё выполнено' : 'Пока пусто') + '</div>';
      } else {
        body.innerHTML = list.map(function (t) {
          return '<div class="task' + (t.done ? ' done' : '') + '" data-id="' + t.id + '">' +
            '<button type="button" class="task-check" data-toggle="' + t.id + '" aria-label="Отметить выполненной" aria-pressed="' + (t.done ? 'true' : 'false') + '">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
            '</button>' +
            '<div class="task-text">' + escapeHtml(t.text) + '</div>' +
            '<button type="button" class="task-del" data-del="' + t.id + '" aria-label="Удалить"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg></button>' +
          '</div>';
        }).join('');
      }
    });

    $('#emptyAll').style.display = state.tasks.length ? 'none' : '';
    $('#matrix').style.display = state.tasks.length ? '' : 'none';

    $$('.task-check', $('#matrix')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-toggle');
        var t = state.tasks.find(function (x) { return x.id === id; });
        if (!t) return;
        t.done = !t.done;
        save();
        renderAll();
      });
    });

    $$('.task-del', $('#matrix')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-del');
        state.tasks = state.tasks.filter(function (t) { return t.id !== id; });
        save();
        renderAll();
      });
    });
  }

  function renderAll() {
    renderSummary();
    renderMatrix();
  }

  // ---------- events ----------
  function initAddBar() {
    var form = $('#addForm');
    var input = $('#fText');
    var urgentToggle = $('#toggleUrgent');
    var importantToggle = $('#toggleImportant');

    urgentToggle.addEventListener('click', function () {
      state.addUrgent = !state.addUrgent;
      urgentToggle.classList.toggle('on', state.addUrgent);
    });
    importantToggle.addEventListener('click', function () {
      state.addImportant = !state.addImportant;
      importantToggle.classList.toggle('on', state.addImportant);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) { input.focus(); return; }

      state.tasks.push({
        id: uid(),
        text: text,
        urgent: state.addUrgent,
        important: state.addImportant,
        done: false,
        createdAt: Date.now()
      });
      save();
      input.value = '';
      input.focus();
      renderAll();
    });
  }

  function initFilters() {
    $('#search').addEventListener('input', function () {
      state.search = this.value;
      renderAll();
    });

    var showDoneRow = $('#showDoneSwitch');
    showDoneRow.addEventListener('click', function () {
      state.showDone = !state.showDone;
      showDoneRow.classList.toggle('on', state.showDone);
      showDoneRow.setAttribute('aria-pressed', state.showDone ? 'true' : 'false');
      renderMatrix();
    });
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    // Каждый модуль изолирован — если один упадёт, остальные всё равно запустятся.
    state.tasks = load();
    [initAddBar, initFilters, renderAll].forEach(function (fn) {
      try { fn(); } catch (e) { console.error('[TaskMatrix] ошибка в ' + fn.name + ':', e); }
    });
  });
})();
