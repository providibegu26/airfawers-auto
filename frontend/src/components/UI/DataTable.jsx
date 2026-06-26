import React from "react";
import EmptyState from "./EmptyState";

const Spinner = () => (
  <svg className="h-5 w-5 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

const alignClass = (align) =>
  align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

/**
 * Tableau de données standard (espace admin).
 *  columns: [{ key, header, align, numeric, className, render(row) }]
 *  data: tableau de lignes
 *  keyField: champ identifiant (def: "id")
 *  loading / emptyState
 *  onRowClick(row) / selectedKey : ligne sélectionnée (sync carte, etc.)
 */
const DataTable = ({
  columns,
  data = [],
  keyField = "id",
  loading = false,
  emptyState,
  onRowClick,
  selectedKey,
  className = "",
}) => {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 ${alignClass(
                    col.align || (col.numeric ? "right" : "left")
                  )} ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                    <Spinner /> Chargement…
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-2">
                  {emptyState || (
                    <EmptyState title="Aucune donnée à afficher" />
                  )}
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const key = row[keyField];
                const selected = selectedKey != null && selectedKey === key;
                return (
                  <tr
                    key={key}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={`${
                      onRowClick ? "cursor-pointer" : ""
                    } transition-colors hover:bg-slate-50 ${
                      selected ? "bg-indigo-50/60" : ""
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-sm text-slate-700 ${alignClass(
                          col.align || (col.numeric ? "right" : "left")
                        )} ${col.numeric ? "tabular-nums" : ""} ${
                          col.cellClassName || ""
                        }`}
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
