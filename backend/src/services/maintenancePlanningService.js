const MAINTENANCE_TYPES_ORDER = ['vidange', 'categorie_b', 'categorie_c'];
const PLANNING_WINDOW_MAX_DAYS = 14;
const DATE_TOLERANCE_DAYS = 5;

const MAINTENANCE_LABELS = {
  vidange: 'Catégorie A',
  categorie_b: 'Catégorie B',
  categorie_c: 'Catégorie C',
};

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEstimatedDate(daysRemaining) {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() + daysRemaining);
  return d;
}

function daysBetween(dateA, dateB) {
  const a = startOfDay(dateA);
  const b = startOfDay(dateB);
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
}

function isDateWithinTolerance(chosenDate, estimatedDate, tolerance = DATE_TOLERANCE_DAYS) {
  return Math.abs(daysBetween(chosenDate, estimatedDate)) <= tolerance;
}

function isDueForPlanning(daysRemaining) {
  return daysRemaining !== undefined && daysRemaining !== null && daysRemaining <= PLANNING_WINDOW_MAX_DAYS;
}

function getNextMaintenanceToPlan(vehicle, activePlans = []) {
  if (!vehicle) return null;

  const plansForVehicle = activePlans.filter(
    (p) => p.vehiculeId === vehicle.id && p.statut === 'planifie'
  );

  for (const type of MAINTENANCE_TYPES_ORDER) {
    const daysRemaining = vehicle[`${type}DaysRemaining`];
    if (!isDueForPlanning(daysRemaining)) continue;

    const seuilKm = vehicle[`${type}NextThreshold`];
    const existingPlan = plansForVehicle.find(
      (p) => p.type === type && p.seuilKm === seuilKm
    );

    if (existingPlan) {
      return null;
    }

    return {
      type,
      typeLabel: MAINTENANCE_LABELS[type],
      daysRemaining,
      nextThreshold: seuilKm,
      estimatedDate: getEstimatedDate(daysRemaining),
    };
  }

  return null;
}

function validatePlanningDate(chosenDate, daysRemaining) {
  const estimatedDate = getEstimatedDate(daysRemaining);
  const parsed = startOfDay(chosenDate);

  if (!isDateWithinTolerance(parsed, estimatedDate)) {
    const diff = daysBetween(estimatedDate, parsed);
    return {
      valid: false,
      error: `La date choisie est à ${Math.abs(diff)} jour(s) de l'estimation (${estimatedDate.toLocaleDateString('fr-FR')}). Maximum autorisé : ±${DATE_TOLERANCE_DAYS} jours.`,
      estimatedDate,
    };
  }

  return { valid: true, estimatedDate };
}

module.exports = {
  MAINTENANCE_TYPES_ORDER,
  PLANNING_WINDOW_MAX_DAYS,
  DATE_TOLERANCE_DAYS,
  MAINTENANCE_LABELS,
  getEstimatedDate,
  daysBetween,
  isDateWithinTolerance,
  isDueForPlanning,
  getNextMaintenanceToPlan,
  validatePlanningDate,
  startOfDay,
};
