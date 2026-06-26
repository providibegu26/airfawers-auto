import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaExpand, FaMapMarkerAlt, FaSync } from "react-icons/fa";
import PannesMap from "../Pannes/PannesMap";
import Card from "../UI/Card";
import Button from "../UI/Button";
import { STATUS_DOTS } from "../UI/statusColors";
import { fetchPannesMap } from "../../services/panneService";

const LEGEND = [
  { variant: "warning", label: "En attente" },
  { variant: "info", label: "En cours" },
];

const MapSection = () => {
  const [pannes, setPannes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPannes = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchPannesMap();
      setPannes(data);
    } catch (err) {
      setError(err.message);
      setPannes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPannes();
  }, []);

  return (
    <Card className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FaMapMarkerAlt className="text-red-500" />
            Pannes actives
          </h2>
          {!loading && (
            <p className="mt-0.5 text-xs text-slate-500">
              {pannes.length} panne{pannes.length !== 1 ? "s" : ""} géolocalisée
              {pannes.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            icon={FaSync}
            loading={loading}
            onClick={loadPannes}
            aria-label="Actualiser la carte"
          />
          <Link
            to="/admin/pannes"
            className="rounded-lg p-2 text-indigo-600 transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Voir toutes les pannes"
          >
            <FaExpand className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {error ? (
        <div className="flex min-h-[260px] flex-1 items-center justify-center rounded-lg bg-red-50 text-sm text-red-600">
          {error}
        </div>
      ) : loading ? (
        <div className="flex min-h-[260px] flex-1 items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
          Chargement de la carte…
        </div>
      ) : (
        <div className="min-h-[260px] flex-1 overflow-hidden rounded-lg">
          <PannesMap pannes={pannes} height="100%" />
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
        {LEGEND.map(({ variant, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${STATUS_DOTS[variant]}`} />
            {label}
          </span>
        ))}
      </div>
    </Card>
  );
};

export default MapSection;
