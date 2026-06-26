import React from "react";

/**
 * En-tête de page unifié : titre + sous-titre + actions à droite.
 * Donne le même "chrome" à tous les écrans (cohérence inter-pages).
 */
const PageHeader = ({ title, subtitle, actions, icon: Icon, className = "" }) => (
  <div
    className={`mb-6 flex flex-wrap items-start justify-between gap-3 ${className}`}
  >
    <div className="flex items-start gap-3">
      {Icon && (
        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Icon className="h-4.5 w-4.5" />
        </span>
      )}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
