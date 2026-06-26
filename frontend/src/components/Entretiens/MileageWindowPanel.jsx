import React, { useCallback, useEffect, useState } from "react";
import { FaLock, FaLockOpen, FaUsers, FaSync } from "react-icons/fa";
import Card from "../UI/Card";
import Button from "../UI/Button";
import StatusBadge from "../UI/StatusBadge";
import {
  fetchMileageWindowStatus,
  openMileageWindow,
  closeMileageWindow,
} from "../../services/mileageWindowService";

const MileageWindowPanel = ({ onStatusChange }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMileageWindowStatus();
      setStatus(data);
      onStatusChange?.(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [onStatusChange]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const handleOpen = async () => {
    setActing(true);
    setError("");
    try {
      await openMileageWindow();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setActing(false);
    }
  };

  const handleClose = async () => {
    setActing(true);
    setError("");
    try {
      await closeMileageWindow();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setActing(false);
    }
  };

  if (loading && !status) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Chargement du statut de saisie…</p>
      </Card>
    );
  }

  const progress =
    status?.totalVehiculesAttribues > 0
      ? Math.round(
          (status.vehiculesMisAJourChauffeur / status.totalVehiculesAttribues) *
            100
        )
      : 0;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            {status?.ouverte ? (
              <FaLockOpen className="text-emerald-600" />
            ) : (
              <FaLock className="text-slate-400" />
            )}
            Saisie kilométrage chauffeurs
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Semaine {status?.semaine} (Kinshasa) — les chauffeurs ne peuvent saisir
            que lorsque l&apos;autorisation est active.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            variant={status?.ouverte ? "success" : "neutral"}
            label={status?.ouverte ? "Autorisation active" : "Fermée"}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FaSync}
            loading={loading}
            onClick={load}
          >
            Actualiser
          </Button>
          {status?.ouverte ? (
            <Button
              variant="secondary"
              size="sm"
              loading={acting}
              onClick={handleClose}
            >
              Fermer l&apos;autorisation
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              loading={acting}
              onClick={handleOpen}
            >
              Autoriser la mise à jour
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
        <span className="flex items-center gap-1.5">
          <FaUsers className="text-slate-400" />
          {status?.vehiculesMisAJourChauffeur ?? 0} /{" "}
          {status?.totalVehiculesAttribues ?? 0} véhicules saisis par les chauffeurs
        </span>
        {status?.totalVehiculesAttribues > 0 && (
          <div className="flex min-w-[140px] flex-1 items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs tabular-nums text-slate-500">{progress}%</span>
          </div>
        )}
      </div>

      {status?.tousMisAJour && !status?.ouverte && (
        <p className="mt-3 text-xs text-emerald-700">
          Tous les chauffeurs ont saisi leur kilométrage — fenêtre fermée automatiquement.
        </p>
      )}
    </Card>
  );
};

export default MileageWindowPanel;
