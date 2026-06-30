export const FUEL_PRICES_FC = {
  ESSENCE: 2440,
  GASOIL: 2430,
};

export const FUEL_LABELS = {
  ESSENCE: "Essence",
  GASOIL: "Gasoil",
};

export function getPrixLitre(typeCarburant) {
  const t = (typeCarburant || "ESSENCE").toUpperCase();
  return FUEL_PRICES_FC[t] ?? FUEL_PRICES_FC.ESSENCE;
}

export function getFuelLabel(typeCarburant) {
  const t = (typeCarburant || "ESSENCE").toUpperCase();
  return FUEL_LABELS[t] ?? FUEL_LABELS.ESSENCE;
}
