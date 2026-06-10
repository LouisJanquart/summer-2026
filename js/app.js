const state = { sortBy: "date", activeStyles: [], skin: "brut" };

function groupBy(arr, keyFn) {
  const out = [],
    idx = {};
  arr.forEach((e) => {
    const k = keyFn(e);
    if (idx[k] == null) {
      idx[k] = out.length;
      out.push({ label: k, events: [] });
    }
    out[idx[k]].events.push(e);
  });
  return out;
}

function render() {
  let list = DATA.map(computeEvent);

  if (state.activeStyles.length)
    list = list.filter((e) =>
      e.styles.some((s) => state.activeStyles.includes(s)),
    );

  const comparators = {
    date: (a, b) => a._t - b._t,
    price: (a, b) =>
      (a.price == null) - (b.price == null) || (a.price || 0) - (b.price || 0),
    venue: (a, b) =>
      a.city.localeCompare(b.city) || a.venue.localeCompare(b.venue),
    style: (a, b) =>
      (a.styles[0] || "").localeCompare(b.styles[0] || "") || a._t - b._t,
  };
  list.sort(comparators[state.sortBy]);

  const groups =
    state.sortBy === "date"
      ? groupBy(list, (e) => e._month)
      : state.sortBy === "venue"
        ? groupBy(list, (e) => e.city)
        : state.sortBy === "style"
          ? groupBy(list, (e) => e.styles[0] || "Autres")
          : [{ label: "", events: list }];

  // --- Grille ---
  const container = document.getElementById("groups-container");
  container.innerHTML = "";
  const emptyMsg = document.getElementById("empty-msg");
  emptyMsg.classList.toggle("empty-msg--visible", list.length === 0);
  document.getElementById("total-count").textContent = DATA.length;

  groups.forEach((g) => {
    const section = document.createElement("section");
    section.className = "group";

    if (g.label) {
      section.innerHTML = `
        <div class="group__header">
          <h2 class="group__title">${g.label}</h2>
          <div class="group__divider"></div>
          <span class="group__count">${g.events.length}</span>
        </div>`;
    }

    const grid = document.createElement("div");
    grid.className = "cards-grid";
    g.events.forEach((e) => grid.appendChild(buildCard(e, state.skin)));
    section.appendChild(grid);
    container.appendChild(section);
  });

  // --- Boutons Trier ---
  const sortContainer = document.getElementById("sort-btns");
  sortContainer.innerHTML = "";
  [
    ["date", "Date"],
    ["price", "Prix"],
    ["venue", "Lieu"],
    ["style", "Style"],
  ].forEach(([k, l]) => {
    const btn = document.createElement("button");
    btn.className = "btn-seg" + (state.sortBy === k ? " btn-seg--active" : "");
    btn.textContent = l;
    btn.addEventListener("click", () => {
      state.sortBy = k;
      render();
    });
    sortContainer.appendChild(btn);
  });

  // --- Boutons Carte ---
  const skinContainer = document.getElementById("skin-btns");
  skinContainer.innerHTML = "";
  [
    ["brut", "Brut"],
    ["affiche", "Affiche"],
    ["pass", "Pass"],
  ].forEach(([k, l]) => {
    const btn = document.createElement("button");
    btn.className = "btn-seg" + (state.skin === k ? " btn-seg--active" : "");
    btn.textContent = l;
    btn.addEventListener("click", () => {
      state.skin = k;
      render();
    });
    skinContainer.appendChild(btn);
  });

  // --- Chips styles ---
  const allStyles = [...new Set(DATA.flatMap((e) => e.styles))].sort();
  const chipsContainer = document.getElementById("style-chips");
  chipsContainer.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.className =
    "btn-chip" + (!state.activeStyles.length ? " btn-chip--active" : "");
  allBtn.textContent = "Tout";
  allBtn.addEventListener("click", () => {
    state.activeStyles = [];
    render();
  });
  chipsContainer.appendChild(allBtn);

  allStyles.forEach((s) => {
    const btn = document.createElement("button");
    btn.className =
      "btn-chip" + (state.activeStyles.includes(s) ? " btn-chip--active" : "");
    btn.textContent = s;
    btn.addEventListener("click", () => {
      state.activeStyles = state.activeStyles.includes(s)
        ? state.activeStyles.filter((x) => x !== s)
        : [...state.activeStyles, s];
      render();
    });
    chipsContainer.appendChild(btn);
  });
}

document.addEventListener("DOMContentLoaded", render);
