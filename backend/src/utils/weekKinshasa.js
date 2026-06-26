const TIMEZONE = 'Africa/Kinshasa';

/**
 * Date civile (YYYY-MM-DD) dans le fuseau Kinshasa.
 */
function getKinshasaDateString(date = new Date()) {
  return date.toLocaleDateString('en-CA', { timeZone: TIMEZONE });
}

/**
 * Numéro de semaine ISO 8601 à partir d'une date YYYY-MM-DD.
 */
function isoWeekFromYmd(year, month, day) {
  const d = new Date(Date.UTC(year, month - 1, day));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}

/**
 * Clé semaine ISO pour Kinshasa : "2026-W13"
 */
function getCurrentWeekKey(date = new Date()) {
  const ymd = getKinshasaDateString(date);
  const [y, m, d] = ymd.split('-').map(Number);
  const { year, week } = isoWeekFromYmd(y, m, d);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

module.exports = {
  TIMEZONE,
  getKinshasaDateString,
  getCurrentWeekKey,
};
