import { computeEvent } from './compute.js';
import { buildCard }    from './card.js';
import { DATA }         from './data.js';

const PICKS_KEY = 'ete2026:picks';

function loadPicks() {
  try { return JSON.parse(localStorage.getItem(PICKS_KEY)) || {}; }
  catch { return {}; }
}
function savePicks(picks) {
  try { localStorage.setItem(PICKS_KEY, JSON.stringify(picks)); } catch {}
}

const state = {
  sortBy: 'date',
  activeStyles: [],
  skin: 'brut',
  view: 'grid',
  picks: loadPicks(),
};

function setPick(id, value) {
  if (state.picks[id] === value) delete state.picks[id];
  else state.picks[id] = value;
  savePicks(state.picks);
  render();
}

// --- Utilitaires ---

function groupBy(arr, keyFn) {
  const out = [], idx = {};
  for (const e of arr) {
    const k = keyFn(e);
    if (idx[k] == null) { idx[k] = out.length; out.push({ label: k, events: [] }); }
    out[idx[k]].events.push(e);
  }
  return out;
}

const makeTodayMid = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// --- Render partiel : grille uniquement ---

function visibleList() {
  const todayMid = makeTodayMid();
  let list = DATA.map(e => computeEvent(e, todayMid));
  if (state.activeStyles.length)
    list = list.filter(e => e.styles.some(s => state.activeStyles.includes(s)));
  return list;
}

function render() {
  document.body.dataset.view = state.view;
  if (state.view === 'agenda') renderAgenda();
  else renderGrid();
}

function renderGrid() {
  const list = visibleList();

  const comparators = {
    date:  (a, b) => a._t - b._t,
    price: (a, b) => (a.price == null) - (b.price == null) || (a.price ?? 0) - (b.price ?? 0),
    venue: (a, b) => a.city.localeCompare(b.city) || a.venue.localeCompare(b.venue),
    style: (a, b) => (a.styles[0] ?? '').localeCompare(b.styles[0] ?? '') || a._t - b._t,
  };
  list.sort(comparators[state.sortBy]);

  const groups =
    state.sortBy === 'date'  ? groupBy(list, e => e._month) :
    state.sortBy === 'venue' ? groupBy(list, e => e.city) :
    state.sortBy === 'style' ? groupBy(list, e => e.styles[0] ?? 'Autres') :
                               [{ label: '', events: list }];

  const container = document.getElementById('groups-container');
  container.innerHTML = '';
  document.getElementById('empty-msg').classList.toggle('empty-msg--visible', list.length === 0);

  for (const g of groups) {
    const section = document.createElement('section');
    section.className = 'group';

    if (g.label) {
      const header = document.createElement('div');
      header.className = 'group__header';
      header.innerHTML = `
        <h2 class="group__title">${g.label}</h2>
        <div class="group__divider" aria-hidden="true"></div>
        <span class="group__count">${g.events.length}</span>`;
      section.appendChild(header);
    }

    const grid = document.createElement('div');
    grid.className = 'cards-grid';
    for (const e of g.events) grid.appendChild(buildCard(e, state.skin, state.picks[e.id]));
    section.appendChild(grid);
    container.appendChild(section);
  }
}


// --- Render : vue par date ---

function esc(str) {
  return String(str).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
}

function renderAgenda() {
  const list = visibleList().sort((a, b) => a._t - b._t || (a.timeStart || '').localeCompare(b.timeStart || ''));
  const days = groupBy(list, e => e.dayKey);

  const container = document.getElementById('groups-container');
  container.innerHTML = '';
  document.getElementById('empty-msg').classList.toggle('empty-msg--visible', list.length === 0);

  let todayMarkerDone = false;

  for (const d of days) {
    const evs   = d.events;
    const first = evs[0];
    const clash = evs.length > 1;

    if (!todayMarkerDone && !first.isPast) {
      todayMarkerDone = true;
      const mark = document.createElement('div');
      mark.className = 'today-mark';
      mark.innerHTML = '<span>aujourd\u2019hui</span>';
      container.appendChild(mark);
    }

    const section = document.createElement('section');
    section.className = 'day'
      + (first.isPast ? ' day--past' : '')
      + (clash ? ' day--clash' : '');

    section.innerHTML = `
      <div class="day__header">
        <h2 class="day__date">${esc(first.dayLabel)}</h2>
        <div class="day__rule" aria-hidden="true"></div>
        ${clash ? `<span class="day__clash">⚠ ${evs.length} en même temps · à trancher</span>` : ''}
        <span class="day__count">${evs.length}</span>
      </div>`;

    const rows = document.createElement('div');
    rows.className = 'day__rows';

    for (const e of evs) {
      const pick = state.picks[e.id];
      const row  = document.createElement('article');
      row.className = 'arow'
        + (e.isPast ? ' arow--past' : '')
        + (pick === 'in'  ? ' arow--in'  : '')
        + (pick === 'out' ? ' arow--out' : '');

      const styles = e.styles.map(s => `<span class="arow__style">${esc(s)}</span>`).join('');

      row.innerHTML = `
        <div class="arow__time">${esc(e.timeLabel || '—')}${e.spanLabel ? `<span class="arow__span">${esc(e.spanLabel)}</span>` : ''}</div>
        <div class="arow__main">
          <h3 class="arow__title">${esc(e.title)}</h3>
          <div class="arow__meta">${esc(e.venue)} — ${esc(e.city)} · par ${esc(e.by)}</div>
          <div class="arow__styles">${styles}</div>
        </div>
        <div class="arow__price">${esc(e.priceLabel)}</div>
        <div class="arow__actions">
          <button type="button" class="arow__btn arow__btn--in" data-act="in">★ Je prends</button>
          <button type="button" class="arow__btn arow__btn--out" data-act="out">✕ Zapper</button>
          ${e.ticketUrl ? `<a class="arow__link" href="${esc(e.ticketUrl)}" target="_blank" rel="noopener noreferrer">Billetterie ↗</a>` : '<span class="arow__link arow__link--none">Lien à venir</span>'}
        </div>`;

      for (const btn of row.querySelectorAll('.arow__btn'))
        btn.addEventListener('click', () => setPick(e.id, btn.dataset.act));

      rows.appendChild(row);
    }

    section.appendChild(rows);
    container.appendChild(section);
  }
}

// --- Render des contrôles (une seule fois au init) ---

function renderControls() {
  document.getElementById('total-count').textContent = DATA.length;

  const viewContainer = document.getElementById('view-btns');
  for (const [k, l] of [['grid', 'Grille'], ['agenda', 'Par date']]) {
    const btn = document.createElement('button');
    btn.className   = 'btn-seg';
    btn.textContent = l;
    btn.dataset.view = k;
    btn.addEventListener('click', () => {
      state.view = k;
      updateActiveBtn(viewContainer, k, 'view');
      render();
    });
    viewContainer.appendChild(btn);
  }

  const sortContainer = document.getElementById('sort-btns');
  for (const [k, l] of [['date', 'Date'], ['price', 'Prix'], ['venue', 'Lieu'], ['style', 'Style']]) {
    const btn = document.createElement('button');
    btn.className   = 'btn-seg';
    btn.textContent = l;
    btn.dataset.sort = k;
    btn.addEventListener('click', () => {
      state.sortBy = k;
      updateActiveBtn(sortContainer, k, 'sort');
      render();
    });
    sortContainer.appendChild(btn);
  }

  const skinContainer = document.getElementById('skin-btns');
  for (const [k, l] of [['brut', 'Brut'], ['affiche', 'Affiche'], ['pass', 'Pass']]) {
    const btn = document.createElement('button');
    btn.className   = 'btn-seg';
    btn.textContent = l;
    btn.dataset.skin = k;
    btn.addEventListener('click', () => {
      state.skin = k;
      updateActiveBtn(skinContainer, k, 'skin');
      render();
    });
    skinContainer.appendChild(btn);
  }

  const allStyles    = [...new Set(DATA.flatMap(e => e.styles))].sort();
  const chipsContainer = document.getElementById('style-chips');

  const allBtn = document.createElement('button');
  allBtn.className    = 'btn-chip btn-chip--active';
  allBtn.textContent  = 'Tout';
  allBtn.dataset.style = '';
  allBtn.addEventListener('click', () => {
    state.activeStyles = [];
    updateActiveChips(chipsContainer);
    render();
  });
  chipsContainer.appendChild(allBtn);

  for (const s of allStyles) {
    const btn = document.createElement('button');
    btn.className    = 'btn-chip';
    btn.textContent  = s;
    btn.dataset.style = s;
    btn.addEventListener('click', () => {
      state.activeStyles = state.activeStyles.includes(s)
        ? state.activeStyles.filter(x => x !== s)
        : [...state.activeStyles, s];
      updateActiveChips(chipsContainer);
      render();
    });
    chipsContainer.appendChild(btn);
  }

  // État initial
  updateActiveBtn(viewContainer, state.view, 'view');
  updateActiveBtn(sortContainer, state.sortBy, 'sort');
  updateActiveBtn(skinContainer, state.skin, 'skin');
}

function updateActiveBtn(container, activeKey, dataAttr) {
  for (const btn of container.querySelectorAll('.btn-seg')) {
    btn.classList.toggle('btn-seg--active', btn.dataset[dataAttr] === activeKey);
  }
}

function updateActiveChips(container) {
  for (const btn of container.querySelectorAll('.btn-chip')) {
    const s = btn.dataset.style;
    const isActive = s === ''
      ? state.activeStyles.length === 0
      : state.activeStyles.includes(s);
    btn.classList.toggle('btn-chip--active', isActive);
  }
}

// --- Init ---

document.addEventListener('DOMContentLoaded', () => {
  renderControls();
  render();
});
