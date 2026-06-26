import React, { useEffect, useState, useMemo } from "react";
import { FaUser, FaUsers } from "react-icons/fa";
import Card from "../UI/Card";
import DataTable from "../UI/DataTable";
import EmptyState from "../UI/EmptyState";
import SearchBar from "../common/SearchBar";
import { apiPath } from "@/config/api";

const API = apiPath("/admin");

const DriversList = () => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [driversRes, vehiclesRes] = await Promise.all([
          fetch(`${API}/chauffeurs`).then((r) => r.json()),
          fetch(`${API}/vehicules`).then((r) => r.json()),
        ]);
        if (!cancelled) {
          setDrivers(driversRes.chauffeurs || []);
          setVehicles(vehiclesRes.vehicules || []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const vehicleByChauffeur = useMemo(() => {
    const map = {};
    vehicles.forEach((v) => {
      if (v.chauffeurId) map[v.chauffeurId] = v;
    });
    return map;
  }, [vehicles]);

  const filteredDrivers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return drivers;
    return drivers.filter(
      (d) =>
        d.nom?.toLowerCase().includes(q) ||
        d.postnom?.toLowerCase().includes(q) ||
        d.prenom?.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q) ||
        d.telephone?.toLowerCase().includes(q)
    );
  }, [drivers, search]);

  const columns = useMemo(
    () => [
      {
        key: "nom",
        header: "Chauffeur",
        render: (driver) => (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <FaUser className="h-3.5 w-3.5" />
            </span>
            <span className="font-medium text-slate-900">
              {[driver.prenom, driver.nom, driver.postnom].filter(Boolean).join(" ")}
            </span>
          </div>
        ),
      },
      {
        key: "telephone",
        header: "Téléphone",
        render: (driver) => (
          <span className="tabular-nums text-slate-700">
            {driver.telephone || "—"}
          </span>
        ),
      },
      {
        key: "vehicule",
        header: "Véhicule",
        render: (driver) => {
          const v = vehicleByChauffeur[driver.id];
          if (!v) return <span className="text-slate-400">—</span>;
          return (
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
              {v.immatriculation}
            </span>
          );
        },
      },
    ],
    [vehicleByChauffeur]
  );

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Liste des chauffeurs</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {filteredDrivers.length} chauffeur{filteredDrivers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="w-full sm:w-64">
          <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un chauffeur…" />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredDrivers}
        loading={loading}
        emptyState={
          <EmptyState
            icon={FaUsers}
            title="Aucun chauffeur trouvé"
            description={search ? "Essayez un autre terme de recherche." : "Aucun chauffeur enregistré."}
          />
        }
      />
    </Card>
  );
};

export default DriversList;
