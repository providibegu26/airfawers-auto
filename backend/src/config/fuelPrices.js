const FUEL_PRICES_FC = {
  ESSENCE: 2440,
  GASOIL: 2430,
};

const FUEL_LABELS = {
  ESSENCE: 'Essence',
  GASOIL: 'Gasoil',
};

function normalizeTypeCarburant(type) {
  const t = (type || 'ESSENCE').toUpperCase();
  return FUEL_PRICES_FC[t] ? t : 'ESSENCE';
}

function getPrixLitre(typeCarburant) {
  return FUEL_PRICES_FC[normalizeTypeCarburant(typeCarburant)];
}

module.exports = {
  FUEL_PRICES_FC,
  FUEL_LABELS,
  normalizeTypeCarburant,
  getPrixLitre,
};
