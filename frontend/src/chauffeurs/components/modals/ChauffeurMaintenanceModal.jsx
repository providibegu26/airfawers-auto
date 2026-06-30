import React, { useState, useEffect } from "react";
import { FaTools, FaSpinner } from "react-icons/fa";
import Modal from "../../../components/UI/Modal";
import ModalCard from "../../../components/UI/ModalCard";
import Button from "../../../components/UI/Button";
import StatusBadge from "../../../components/UI/StatusBadge";
import { apiPath } from "@/config/api";
import {
  getMaintenanceScheduleForVehicle,
  getClosestMaintenance,
  formatMaintenanceCountdownLong,
} from "../../../services/maintenanceService";

const urgencyVariant = (days) => {
  if (days < 0 || days <= 7) return "danger";
  if (days <= 14) return "warning";
  return "success";
};

const urgencyLabel = (days) => {
  if (days < 0) return "En retard";
  if (days <= 7) return "Urgent";
  if (days <= 14) return "À venir";
  return "Normal";
};

const ChauffeurMaintenanceModal = ({ isOpen, onClose }) => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) fetchVehicleData();
  }, [isOpen]);

  const fetchVehicleData = async () => {
    setLoading(true);
    setError("");
    setVehicle(null);
    try {
      const token = localStorage.getItem("chauffeurToken");
      if (!token) throw new Error("Session expirée");

      const response = await fetch(
        apiPath("/auth/chauffeur/profile"),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (data.success && data.chauffeur?.vehicule) {
        setVehicle(data.chauffeur.vehicule);
      } else {
        setError("Aucun véhicule attribué.");
      }
    } catch (e) {
      setError(e.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const getMaintenanceData = (v) => getMaintenanceScheduleForVehicle(v);

  const maintenanceData = vehicle ? getMaintenanceData(vehicle) : [];
  const closest = vehicle ? getClosestMaintenance(vehicle) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Entretiens prévisionnels"
      icon={FaTools}
      size="md"
      footer={
        <Button variant="primary" size="sm" onClick={onClose}>
          Fermer
        </Button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
          <FaSpinner className="animate-spin" />
          Chargement…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : !vehicle ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Aucun véhicule attribué.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Véhicule</span>
              <span className="font-medium text-slate-900">
                {vehicle.marque} {vehicle.modele}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Kilométrage</span>
              <span className="font-medium tabular-nums text-slate-900">
                {vehicle.kilometrage?.toLocaleString("fr-FR")} km
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Catégorie</span>
              <span className="font-medium text-slate-900">
                {vehicle.categorie || "LIGHT"}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {closest && (
              <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                  Prochain entretien (le plus proche)
                </p>
                <p className="mt-1 text-lg font-bold text-amber-950">
                  {closest.typeLabel}
                </p>
                <p className="text-sm font-medium text-amber-800">
                  {formatMaintenanceCountdownLong(closest.daysRemaining)}
                </p>
                <p className="mt-1 text-xs text-amber-700">
                  {closest.maintenanceDate.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}

            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Toutes les échéances
            </p>
            {maintenanceData.map((m) => {
              const isClosest = closest?.type === m.type;
              return (
              <ModalCard
                key={m.type}
                className={isClosest ? "ring-2 ring-amber-300" : ""}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-900">
                    {m.typeLabel}
                    {isClosest && (
                      <span className="ml-2 text-xs font-normal text-amber-600">
                        (le plus proche)
                      </span>
                    )}
                  </span>
                  <StatusBadge
                    variant={urgencyVariant(m.daysRemaining)}
                    label={urgencyLabel(m.daysRemaining)}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Jours restants :{" "}
                  <span
                    className={`font-semibold tabular-nums ${
                      m.daysRemaining <= 7 ? "text-red-600" : "text-slate-700"
                    }`}
                  >
                    {m.daysRemaining < 0
                      ? `${Math.abs(m.daysRemaining)} jour(s) de retard`
                      : `${m.daysRemaining} jour(s)`}
                  </span>
                </p>
              </ModalCard>
            );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ChauffeurMaintenanceModal;
