import React from "react";
import {
  FaExclamationTriangle,
  FaClock,
  FaCheckCircle,
  FaTools,
} from "react-icons/fa";

const STAT_CARDS = [
  {
    key: "total",
    label: "Total",
    icon: FaExclamationTriangle,
    iconClass: "bg-indigo-100 text-indigo-600",
  },
  {
    key: "enAttente",
    label: "En attente",
    icon: FaClock,
    iconClass: "bg-amber-100 text-amber-600",
  },
  {
    key: "enCours",
    label: "En cours",
    icon: FaTools,
    iconClass: "bg-blue-100 text-blue-600",
  },
  {
    key: "resolues",
    label: "Résolues",
    icon: FaCheckCircle,
    iconClass: "bg-emerald-100 text-emerald-600",
  },
];

const PannesStatsCards = ({ stats = {} }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {STAT_CARDS.map(({ key, label, icon: Icon, iconClass }) => (
      <div key={key} className="rounded-lg bg-white p-4 shadow">
        <div className="flex items-center">
          <div className={`rounded-md p-2.5 ${iconClass}`}>
            <Icon />
          </div>
          <div className="ml-4">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="text-xl font-bold tabular-nums text-slate-900">
              {stats[key] ?? 0}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default PannesStatsCards;
