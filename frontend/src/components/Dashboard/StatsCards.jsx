import React, { useEffect, useState } from "react";
import {
  FaUserTie,
  FaCar,
  FaTools,
  FaExclamationTriangle,
} from "react-icons/fa";
import { fetchPanneStats } from "../../services/panneService";
import { apiPath } from "@/config/api";

const API = apiPath("/admin");

const STAT_ITEMS = [
  { key: "chauffeurs", label: "Chauffeurs", icon: FaUserTie, iconClass: "bg-indigo-100 text-indigo-600" },
  { key: "vehicules", label: "Véhicules", icon: FaCar, iconClass: "bg-purple-100 text-purple-600" },
  { key: "entretiens", label: "Entretiens urgents", icon: FaTools, iconClass: "bg-red-100 text-red-600" },
  { key: "pannes", label: "Pannes actives", icon: FaExclamationTriangle, iconClass: "bg-amber-100 text-amber-600" },
];

const StatsCards = () => {
  const [values, setValues] = useState({ chauffeurs: 0, vehicules: 0, entretiens: 0, pannes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [chauffeursRes, vehiculesRes, panneStats] = await Promise.all([
          fetch(`${API}/chauffeurs`).then((r) => r.json()),
          fetch(`${API}/vehicules`).then((r) => r.json()),
          fetchPanneStats().catch(() => ({ actives: 0 })),
        ]);

        if (cancelled) return;

        const vehicles = vehiculesRes.vehicules || [];
        let urgentCount = 0;

        vehicles.forEach((vehicle) => {
          const historiqueEntretiens = vehicle.historiqueEntretiens || [];
          ["vidange", "bougies", "freins"].forEach((type) => {
            const daysRemaining = vehicle[`${type}DaysRemaining`];
            if (daysRemaining !== undefined && daysRemaining <= 7) {
              const dernierEntretien = historiqueEntretiens.find(
                (e) => e.type.toLowerCase() === type.toLowerCase()
              );
              if (!dernierEntretien) urgentCount++;
            }
          });
        });

        setValues({
          chauffeurs: (chauffeursRes.chauffeurs || []).length,
          vehicules: vehicles.length,
          entretiens: urgentCount,
          pannes: panneStats.actives || 0,
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STAT_ITEMS.map(({ key, label, icon: Icon, iconClass }) => (
        <div key={key} className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center">
            <div className={`rounded-md p-2.5 ${iconClass}`}>
              <Icon />
            </div>
            <div className="ml-4">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              {loading ? (
                <div className="mt-1 h-7 w-10 animate-pulse rounded bg-slate-100" />
              ) : (
                <p className="text-xl font-bold tabular-nums text-slate-900">
                  {values[key]}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
