import React, { useEffect, useState } from "react";
import {
  FaCar,
  FaUserTie,
  FaDollarSign,
  FaExclamationTriangle,
} from "react-icons/fa";
import { fetchPanneStats } from "../../services/panneService";
import { apiPath } from "@/config/api";

const API = apiPath("/admin");

const STAT_ITEMS = [
  { key: "vehicules", label: "Véhicules", icon: FaCar, iconClass: "bg-indigo-100 text-indigo-600" },
  { key: "chauffeurs", label: "Chauffeurs", icon: FaUserTie, iconClass: "bg-blue-100 text-blue-600" },
  { key: "coutMensuel", label: "Coût mensuel", icon: FaDollarSign, iconClass: "bg-amber-100 text-amber-600", isCurrency: true },
  { key: "pannes", label: "Pannes actives", icon: FaExclamationTriangle, iconClass: "bg-red-100 text-red-600" },
];

const StatsCards = () => {
  const [values, setValues] = useState({
    vehicules: 0,
    chauffeurs: 0,
    coutMensuel: 0,
    pannes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [vehRes, chRes, panneStats, rapportsRes] = await Promise.all([
          fetch(`${API}/vehicules`).then((r) => r.json()),
          fetch(`${API}/chauffeurs`).then((r) => r.json()),
          fetchPanneStats().catch(() => ({ actives: 0 })),
          fetch(`${API}/carburant/rapports?periode=monthly`).then((r) => r.json()).catch(() => ({})),
        ]);

        if (cancelled) return;

        const now = new Date();
        const key = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
        const fc = (rapportsRes.aggreg && rapportsRes.aggreg[key]?.cout) || 0;

        setValues({
          vehicules: (vehRes.vehicules || []).length,
          chauffeurs: (chRes.chauffeurs || []).length,
          coutMensuel: fc / 2850,
          pannes: panneStats.actives || 0,
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const formatValue = (key, val) => {
    if (STAT_ITEMS.find((s) => s.key === key)?.isCurrency) {
      return val > 0
        ? `$ ${val.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : "N/A";
    }
    return val;
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STAT_ITEMS.map(({ key, label, icon: Icon, iconClass }) => (
        <div key={key} className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center">
            <div className={`rounded-md p-2.5 ${iconClass}`}>
              <Icon />
            </div>
            <div className="ml-4">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              {loading ? (
                <div className="mt-1 h-7 w-14 animate-pulse rounded bg-slate-100" />
              ) : (
                <p className="text-xl font-bold tabular-nums text-slate-900">
                  {formatValue(key, values[key])}
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
