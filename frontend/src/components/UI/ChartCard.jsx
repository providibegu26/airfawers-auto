import React from "react";
import Card from "./Card";

/**
 * Conteneur standard pour les graphiques Chart.js.
 *  title / subtitle : en-tête
 *  filters : [{ key, label }] — pills décoratifs optionnels
 *  activeFilter : clé active
 *  height : classe Tailwind de hauteur (def. h-64)
 */
const ChartCard = ({
  title,
  subtitle,
  filters,
  activeFilter,
  onFilterClick,
  height = "h-64",
  className = "",
  children,
}) => (
  <Card className={className}>
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
      {filters?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onFilterClick?.(key)}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                activeFilter === key
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
    <div className={`relative ${height}`}>{children}</div>
  </Card>
);

export default ChartCard;
