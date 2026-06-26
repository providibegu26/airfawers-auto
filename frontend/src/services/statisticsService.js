import { apiPath } from "@/config/api";

const API = apiPath("/admin");
const USD_RATE = 2850;

const FUEL_COEF = {
  HEAVY: 0.2,
  LIGHT: 0.08,
};

const getCoef = (categorie) =>
  FUEL_COEF[(categorie || "LIGHT").toUpperCase()] ?? FUEL_COEF.LIGHT;

export const getLast6MonthKeys = () => {
  const keys = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    keys.push(
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
    );
  }
  return keys;
};

export const monthKeyFromDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};

export const formatMonthLabel = (key) => {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("fr-FR", {
    month: "short",
  });
};

const fetchVehicles = async () => {
  const res = await fetch(`${API}/vehicules`);
  const data = await res.json();
  return data.vehicules || [];
};

const fetchFuelHistorique = async () => {
  const res = await fetch(`${API}/carburant/historique/global`);
  const data = await res.json();
  return data.attributions || [];
};

const fetchFuelRapportMonthly = async () => {
  const res = await fetch(`${API}/carburant/rapports?periode=monthly`);
  const data = await res.json();
  return data.aggreg || {};
};

/** Top N véhicules par kilométrage actuel */
export const fetchTopVehiclesByKm = async (limit = 5) => {
  const vehicles = await fetchVehicles();
  return vehicles
    .map((v) => ({
      label: v.immatriculation,
      km: v.currentMileage ?? v.kilometrage ?? 0,
    }))
    .sort((a, b) => b.km - a.km)
    .slice(0, limit);
};

/** Kilométrage mensuel moyen par véhicule (6 derniers mois) */
export const fetchAvgMonthlyMileage = async () => {
  const [vehicles, attributions] = await Promise.all([
    fetchVehicles(),
    fetchFuelHistorique(),
  ]);

  const vehicleCount = Math.max(vehicles.length, 1);
  const vehiclesMap = Object.fromEntries(vehicles.map((v) => [v.id, v]));
  const keys = getLast6MonthKeys();

  const kmTotalByMonth = Object.fromEntries(keys.map((k) => [k, 0]));

  attributions.forEach((a) => {
    const key = monthKeyFromDate(a.date);
    if (!(key in kmTotalByMonth)) return;
    const v = vehiclesMap[a.vehiculeId];
    const coef = getCoef(v?.categorie);
    kmTotalByMonth[key] += (a.quantite || 0) / coef;
  });

  const fallbackAvg =
    vehicles.reduce((sum, v) => sum + (v.weeklyKm || 0) * 4, 0) / vehicleCount;

  return keys.map((key) => {
    const totalKm = kmTotalByMonth[key];
    const avgKm =
      totalKm > 0 ? Math.round(totalKm / vehicleCount) : Math.round(fallbackAvg);
    return { key, label: formatMonthLabel(key), km: avgKm };
  });
};

/** Coût carburant mensuel en USD (6 derniers mois) */
export const fetchFuelCostLast6Months = async () => {
  const aggreg = await fetchFuelRapportMonthly();
  const keys = getLast6MonthKeys();

  return keys.map((key) => ({
    key,
    label: formatMonthLabel(key),
    costUsd: Math.round((aggreg[key]?.cout || 0) / USD_RATE),
  }));
};

/** Consommation carburant moyenne mensuelle par véhicule (litres, 6 mois) */
export const fetchAvgMonthlyFuelConsumption = async () => {
  const [vehicles, aggreg] = await Promise.all([
    fetchVehicles(),
    fetchFuelRapportMonthly(),
  ]);

  const vehicleCount = Math.max(vehicles.length, 1);
  const keys = getLast6MonthKeys();

  return keys.map((key) => ({
    key,
    label: formatMonthLabel(key),
    litres: Number(((aggreg[key]?.litres || 0) / vehicleCount).toFixed(1)),
  }));
};
