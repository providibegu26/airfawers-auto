import React from "react";
import { STATUS_VARIANTS, STATUS_DOTS } from "./statusColors";

// Compat ascendante avec l'ancien usage <StatusBadge status="pending" />
const LEGACY_STATUS = {
  pending: { variant: "warning", label: "En attente" },
  progress: { variant: "info", label: "En cours" },
  resolved: { variant: "success", label: "Résolue" },
};

/**
 * Badge de statut unifié.
 *  - variant: success | info | warning | danger | neutral
 *  - label / children: texte affiché
 *  - status (legacy): pending | progress | resolved
 *  - dot: petit point coloré devant le texte
 */
const StatusBadge = ({
  variant,
  status,
  label,
  children,
  dot = true,
  className = "",
}) => {
  let resolvedVariant = variant;
  let resolvedLabel = label ?? children;

  if (!resolvedVariant && status && LEGACY_STATUS[status]) {
    resolvedVariant = LEGACY_STATUS[status].variant;
    resolvedLabel = resolvedLabel ?? LEGACY_STATUS[status].label;
  }

  const v = STATUS_VARIANTS[resolvedVariant] ? resolvedVariant : "neutral";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_VARIANTS[v]} ${className}`}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[v]}`} aria-hidden="true" />
      )}
      {resolvedLabel}
    </span>
  );
};

export default StatusBadge;
