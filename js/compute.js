const WD = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MO = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
            'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function computeEvent(e, todayMid) {
  const r = { ...e };

  r.priceLabel = e.price != null
    ? e.price.toFixed(2).replace('.', ',') + ' €'
    : 'À confirmer';

  r.serial = '#' + (e.date ? e.date.replace(/-/g, '').slice(2) : 'TBC')
           + '·' + e.id.replace(/[^a-z]/g, '').slice(0, 3).toUpperCase();

  if (!e.date) {
    r._t             = Infinity;
    r._month         = 'À CONFIRMER';
    r.frontDate      = 'Date à confirmer';
    r.dateLong       = 'Date à confirmer';
    r.countdownLabel = 'À venir';
    r.badgeClass     = 'card__badge--past';
    return r;
  }

  const d    = new Date(e.date + 'T12:00');
  const dMid = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  r._t     = d.getTime();
  r._month = MO[d.getMonth()].toUpperCase();

  const diff = Math.round((dMid - todayMid) / 86400000);

  const badge = diff < 0  ? { label: 'Passé',         cls: 'card__badge--past' }
              : diff === 0 ? { label: "Aujourd'hui",   cls: 'card__badge--upcoming' }
              : diff === 1 ? { label: 'Demain',        cls: 'card__badge--upcoming' }
              :              { label: `J-${diff}`,     cls: 'card__badge--upcoming' };

  r.countdownLabel = badge.label;
  r.badgeClass     = badge.cls;

  const time = (e.timeStart && e.timeEnd) ? `${e.timeStart} › ${e.timeEnd}` : '';

  if (e.endDate) {
    const d2 = new Date(e.endDate + 'T12:00');
    const sm = d2.getMonth() === d.getMonth();
    r.frontDate = sm
      ? `${d.getDate()} → ${d2.getDate()} ${MO[d.getMonth()].toUpperCase()}`
      : `${d.getDate()} ${MO[d.getMonth()].slice(0, 4).toUpperCase()} → ${d2.getDate()} ${MO[d2.getMonth()].slice(0, 4).toUpperCase()}`;
    r.dateLong = sm
      ? `Du ${d.getDate()} au ${d2.getDate()} ${MO[d.getMonth()]} 2026`
      : `Du ${d.getDate()} ${MO[d.getMonth()]} au ${d2.getDate()} ${MO[d2.getMonth()]} 2026`;
  } else {
    r.frontDate = `${WD[d.getDay()].toUpperCase()} ${d.getDate()} ${MO[d.getMonth()].toUpperCase()}${time ? ' · ' + time : ''}`;
    r.dateLong  = `${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]} 2026${time ? ' · ' + time : ''}`;
  }

  return r;
}

export { computeEvent };
