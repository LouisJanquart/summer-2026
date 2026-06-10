const WD = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MO = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

function computeEvent(e) {
  const now = new Date();
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const r = { ...e };

  r.priceLabel =
    e.price != null
      ? e.price.toFixed(2).replace(".", ",") + " €"
      : "À confirmer";

  r.serial =
    "#" +
    (e.date ? e.date.replace(/-/g, "").slice(2) : "TBC") +
    "·" +
    e.id
      .replace(/[^a-z]/g, "")
      .slice(0, 3)
      .toUpperCase();

  if (!e.date) {
    r._t = Infinity;
    r._month = "À CONFIRMER";
    r.frontDate = "Date à confirmer";
    r.dateLong = "Date à confirmer";
    r.countdownLabel = "À venir";
    r.badgeBg = "#2a2a2a";
    r.badgeColor = "#aaa";
    return r;
  }

  const d = new Date(e.date + "T12:00");
  const dMid = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  r._t = d.getTime();
  r._month = MO[d.getMonth()].toUpperCase();

  const diff = Math.round((dMid - todayMid) / 86400000);
  if (diff < 0) {
    r.countdownLabel = "Passé";
    r.badgeBg = "#2a2a2a";
    r.badgeColor = "#aaa";
  } else if (diff === 0) {
    r.countdownLabel = "Aujourd'hui";
    r.badgeBg = "#ff5a1f";
    r.badgeColor = "#0a0a0a";
  } else if (diff === 1) {
    r.countdownLabel = "Demain";
    r.badgeBg = "#ff5a1f";
    r.badgeColor = "#0a0a0a";
  } else {
    r.countdownLabel = "J-" + diff;
    r.badgeBg = "#ff5a1f";
    r.badgeColor = "#0a0a0a";
  }

  const time = e.timeStart && e.timeEnd ? e.timeStart + " › " + e.timeEnd : "";

  if (e.endDate) {
    const d2 = new Date(e.endDate + "T12:00");
    const sm = d2.getMonth() === d.getMonth();
    r.frontDate = sm
      ? d.getDate() +
        " → " +
        d2.getDate() +
        " " +
        MO[d.getMonth()].toUpperCase()
      : d.getDate() +
        " " +
        MO[d.getMonth()].slice(0, 4).toUpperCase() +
        " → " +
        d2.getDate() +
        " " +
        MO[d2.getMonth()].slice(0, 4).toUpperCase();
    r.dateLong = sm
      ? "Du " +
        d.getDate() +
        " au " +
        d2.getDate() +
        " " +
        MO[d.getMonth()] +
        " 2026"
      : "Du " +
        d.getDate() +
        " " +
        MO[d.getMonth()] +
        " au " +
        d2.getDate() +
        " " +
        MO[d2.getMonth()] +
        " 2026";
  } else {
    r.frontDate =
      WD[d.getDay()].toUpperCase() +
      " " +
      d.getDate() +
      " " +
      MO[d.getMonth()].toUpperCase() +
      (time ? " · " + time : "");
    r.dateLong =
      WD[d.getDay()] +
      " " +
      d.getDate() +
      " " +
      MO[d.getMonth()] +
      " 2026" +
      (time ? " · " + time : "");
  }

  return r;
}
