import React from "react";

// Teintes d'icône par accent (l'accent reste discret, la donnée est le héros).
const ICON_ACCENTS = {
  slate: "bg-slate-100 text-slate-500",
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
};

/**
 * Carte KPI plate et bordée. Le chiffre utilise des chiffres tabulaires
 * (effet "instrument") — signature visuelle de FleetTech.
 *  label: libellé court
 *  value: valeur (nombre/texte)
 *  hint: précision sous le chiffre (peut être coloré via hintClassName)
 *  icon: composant icône
 *  accent: slate | indigo | emerald | blue | amber | red
 */
const KpiCard = ({
  label,
  value,
  hint,
  icon: Icon,
  accent = "slate",
  hintClassName = "text-slate-400",
  loading = false,
  className = "",
}) => (
  <div
    className={`bg-white border border-slate-200 rounded-xl p-5 ${className}`}
  >
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-500">{label}</p>
      {Icon && (
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            ICON_ACCENTS[accent] || ICON_ACCENTS.slate
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
      )}
    </div>
    {loading ? (
      <div className="mt-3 h-7 w-16 rounded bg-slate-100 animate-pulse" />
    ) : (
      <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
        {value}
      </p>
    )}
    {hint && <p className={`mt-1 text-xs ${hintClassName}`}>{hint}</p>}
  </div>
);

export default KpiCard;
