import { computeEvent } from './compute.js';
import { buildCard }    from './card.js';
import { DATA }         from './data.js';

const state = { sortBy: 'date', activeStyles: [], skin: 'brut' };

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

function renderGrid() {
  const todayMid = makeTodayMid();
  let list = DATA.map(e => computeEvent(e, todayMid));

  if (state.activeStyles.length)
    list = list.filter(e => e.styles.some(s => state.activeStyles.includes(s)));

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
    for (const e of g.events) grid.appendChild(buildCard(e, state.skin));
    section.appendChild(grid);
    container.appendChild(section);
  }
}

// --- Render des contrôles (une seule fois au init) ---

function renderControls() {
  document.getElementById('total-count').textContent = DATA.length;

  const sortContainer = document.getElementById('sort-btns');
  for (const [k, l] of [['date', 'Date'], ['price', 'Prix'], ['venue', 'Lieu'], ['style', 'Style']]) {
    const btn = document.createElement('button');
    btn.className   = 'btn-seg';
    btn.textContent = l;
    btn.dataset.sort = k;
    btn.addEventListener('click', () => {
      state.sortBy = k;
      updateActiveBtn(sortContainer, k, 'sort');
      renderGrid();
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
      renderGrid();
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
    renderGrid();
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
      renderGrid();
    });
    chipsContainer.appendChild(btn);
  }

  // État initial
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
  renderGrid();
});
