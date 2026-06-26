import React, { useState, useEffect } from "react";
import { FaTools, FaSpinner } from "react-icons/fa";
import Modal from "../../../components/UI/Modal";
import ModalCard from "../../../components/UI/ModalCard";
import Button from "../../../components/UI/Button";
import StatusBadge from "../../../components/UI/StatusBadge";
import { apiPath } from "@/config/api";

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

  const getMaintenanceData = (v) => {
    const thresholds = {
      HEAVY: { vidange: 8000, categorie_b: 16000, categorie_c: 24000 },
      LIGHT: { vidange: 5000, categorie_b: 10000, categorie_c: 15000 },
    };
    const category = thresholds[v.categorie] ? v.categorie : "LIGHT";
    const t = thresholds[category];
    const currentKm = v.kilometrage || 0;
    const weeklyKm = v.weeklyKm || 500;

    return [
      { name: "Catégorie A", key: "vidange", threshold: t.vidange },
      { name: "Catégorie B", key: "categorie_b", threshold: t.categorie_b },
      { name: "Catégorie C", key: "categorie_c", threshold: t.categorie_c },
    ].map(({ name, threshold }) => {
      const remainingKm = threshold - (currentKm % threshold);
      const remainingDays = Math.ceil((remainingKm / weeklyKm) * 7);
      return { name, remainingDays };
    });
  };

  const maintenanceData = vehicle ? getMaintenanceData(vehicle) : [];

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
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Échéances
            </p>
            {maintenanceData.map((m) => (
              <ModalCard key={m.name}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-900">
                    {m.name}
                  </span>
                  <StatusBadge
                    variant={urgencyVariant(m.remainingDays)}
                    label={urgencyLabel(m.remainingDays)}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Jours restants :{" "}
                  <span
                    className={`font-semibold tabular-nums ${
                      m.remainingDays <= 7 ? "text-red-600" : "text-slate-700"
                    }`}
                  >
                    {m.remainingDays < 0
                      ? `${Math.abs(m.remainingDays)} jour(s) de retard`
                      : `${m.remainingDays} jour(s)`}
                  </span>
                </p>
              </ModalCard>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ChauffeurMaintenanceModal;
