import React from "react";

/**
 * État vide réutilisable : une invitation à agir, pas un cul-de-sac.
 */
const EmptyState = ({ icon: Icon, title, description, action, className = "" }) => (
  <div
    className={`flex flex-col items-center justify-center px-4 py-12 text-center ${className}`}
  >
    {Icon && (
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon className="h-6 w-6" />
      </div>
    )}
    <p className="text-sm font-medium text-slate-700">{title}</p>
    {description && (
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
