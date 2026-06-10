function mediaHTML(e) {
  if (e.image) return `<img src="${e.image}" alt="${e.title}">`;
  return `<div class="card__no-image"><span>Visuel à ajouter</span></div>`;
}

function buildFrontBrut(e) {
  const styles = e.styles
    .map(s => `<span class="card-brut__style-tag">${s}</span>`)
    .join('');

  return `
    <div class="card-brut__media">
      ${mediaHTML(e)}
      <div class="card-brut__badge ${e.badgeClass}">${e.countdownLabel}</div>
    </div>
    <div class="card-brut__body">
      <div class="card-brut__date">${e.frontDate}</div>
      <h3 class="card-brut__title">${e.title}</h3>
      <div class="card-brut__by">par ${e.by}</div>
      <div class="card-brut__styles">${styles}</div>
      <div class="card-brut__spacer"></div>
      <div class="card-brut__venue">${e.venue} — ${e.city}</div>
      <div class="card-brut__footer">
        <span class="card-brut__price">${e.priceLabel}</span>
        <span class="card-brut__cta">Détails ↻</span>
      </div>
    </div>`;
}

function buildFrontAffiche(e) {
  return `
    <div class="card-affiche__media">
      ${mediaHTML(e)}
      <div class="card-affiche__overlay" aria-hidden="true"></div>
      <div class="card-affiche__badge ${e.badgeClass}">${e.countdownLabel}</div>
      <div class="card-affiche__caption">
        <div class="card-affiche__date">${e.frontDate}</div>
        <h3 class="card-affiche__title">${e.title}</h3>
      </div>
    </div>
    <div class="card-affiche__footer">
      <div class="card-affiche__venue">${e.venue} — ${e.city}</div>
      <span class="card-affiche__price">${e.priceLabel}</span>
    </div>`;
}

function buildFrontPass(e) {
  return `
    <div class="card-pass">
      <div class="card-pass__header">
        <span class="card-pass__label">Pass · Été 2026</span>
        <span class="card-pass__badge ${e.badgeClass}">${e.countdownLabel}</span>
      </div>
      <div class="card-pass__media">${mediaHTML(e)}</div>
      <div class="card-pass__body">
        <div class="card-pass__date">${e.frontDate}</div>
        <h3 class="card-pass__title">${e.title}</h3>
        <div class="card-pass__venue">${e.venue} — ${e.city}</div>
      </div>
      <div class="card-pass__spacer"></div>
      <div class="card-pass__tear" aria-hidden="true"></div>
      <div class="card-pass__footer">
        <div class="card-pass__barcode" aria-hidden="true"></div>
        <div class="card-pass__info">
          <div>
            <div class="card-pass__admit">Admit one · 1 personne</div>
            <div class="card-pass__serial">${e.serial}</div>
          </div>
          <span class="card-pass__price">${e.priceLabel}</span>
        </div>
        <div class="card-pass__hint">↻ Retourner pour les détails</div>
      </div>
    </div>`;
}

function buildBack(e) {
  const lineup = e.lineup?.length
    ? e.lineup.map(a => `<div class="card-back__artist">${a}</div>`).join('')
    : `<div class="card-back__no-lineup">Lineup à venir.</div>`;

  const text = e.text
    ? `<p class="card-back__text">${e.text}</p>`
    : '';

  return `
    <div class="card-back__header">
      <span class="card-back__tag">Détails</span>
      <span class="card-back__close">↺ Fermer</span>
    </div>
    <h3 class="card-back__title">${e.title}</h3>
    <div class="card-back__by">par ${e.by}</div>
    <div class="card-back__details">
      <div class="card-back__detail-row">
        <span class="card-back__detail-icon" aria-hidden="true">▸</span>
        <span>${e.dateLong}</span>
      </div>
      <div class="card-back__detail-row">
        <span class="card-back__detail-icon" aria-hidden="true">▸</span>
        <span>${e.venue}</span>
      </div>
      <div class="card-back__detail-row">
        <span class="card-back__detail-icon" aria-hidden="true">▸</span>
        <span class="card-back__detail-address">${e.address}</span>
      </div>
    </div>
    ${text}
    <div class="card-back__lineup-label">Lineup</div>
    <div class="card-back__lineup">${lineup}</div>
    <div class="card-back__spacer"></div>
    <div class="card-back__footer">
      <div>
        <div class="card-back__price-label">Prix</div>
        <div class="card-back__price-value">${e.priceLabel}</div>
      </div>
    </div>
    <div class="card-back__return">← Cliquer pour revenir</div>`;
}

function buildCard(e, skin) {
  const wrap  = document.createElement('div');
  wrap.className = 'card';

  const inner = document.createElement('div');
  inner.className = 'card__inner';
  inner.setAttribute('role', 'button');
  inner.setAttribute('tabindex', '0');
  inner.setAttribute('aria-label', e.title);

  const SKINS = {
    brut:    buildFrontBrut,
    affiche: buildFrontAffiche,
    pass:    buildFrontPass,
  };

  const front = document.createElement('div');
  front.className = 'card__front';
  front.innerHTML = (SKINS[skin] ?? SKINS.brut)(e);

  const back = document.createElement('div');
  back.className = 'card__back';
  back.innerHTML = buildBack(e);

  // Bouton billetterie — addEventListener plutôt que onclick inline
  if (e.ticketUrl) {
    const ticketBtn = document.createElement('a');
    ticketBtn.className    = 'card-back__ticket-btn';
    ticketBtn.href         = e.ticketUrl;
    ticketBtn.target       = '_blank';
    ticketBtn.rel          = 'noopener noreferrer';
    ticketBtn.textContent  = 'Billetterie ↗';
    ticketBtn.addEventListener('click', ev => ev.stopPropagation());
    back.querySelector('.card-back__footer').appendChild(ticketBtn);
  } else {
    const soon = document.createElement('span');
    soon.className   = 'card-back__ticket-soon';
    soon.textContent = 'Lien à venir';
    back.querySelector('.card-back__footer').appendChild(soon);
  }

  const toggle = () => inner.classList.toggle('card__inner--flipped');
  inner.addEventListener('click', toggle);
  inner.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') toggle(); });

  inner.appendChild(front);
  inner.appendChild(back);
  wrap.appendChild(inner);
  return wrap;
}

export { buildCard };
