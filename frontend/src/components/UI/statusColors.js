// Palette sémantique unique pour FleetTech.
// Chaque statut métier est mappé vers une variante visuelle cohérente.

export const STATUS_VARIANTS = {
  success: "text-emerald-700 bg-emerald-50 ring-emerald-600/10",
  info: "text-blue-700 bg-blue-50 ring-blue-600/10",
  warning: "text-amber-700 bg-amber-50 ring-amber-600/10",
  danger: "text-red-700 bg-red-50 ring-red-600/10",
  neutral: "text-slate-600 bg-slate-100 ring-slate-500/10",
};

export const STATUS_DOTS = {
  success: "bg-emerald-500",
  info: "bg-blue-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  neutral: "bg-slate-400",
};

// --- Mappings domaine flotte ---

export const PANNE_STATUS = {
  en_attente: { variant: "warning", label: "En attente" },
  en_cours: { variant: "info", label: "En cours" },
  resolue: { variant: "success", label: "Résolue" },
};

export const PANNE_NIVEAU = {
  utilisable: { variant: "success", label: "Utilisable" },
  limite: { variant: "warning", label: "Limité" },
  immobilise: { variant: "danger", label: "Immobilisé" },
};

export const VEHICULE_STATUS = {
  disponible: { variant: "success", label: "Disponible" },
  attribué: { variant: "info", label: "Attribué" },
  attribue: { variant: "info", label: "Attribué" },
  en_panne: { variant: "danger", label: "En panne" },
  "non attribué": { variant: "neutral", label: "Non attribué" },
};

// Résout un statut domaine -> { variant, label }
export function resolveStatus(map, key, fallbackLabel) {
  return (
    map[key] || { variant: "neutral", label: fallbackLabel ?? key ?? "—" }
  );
}
