import React, { useState, useEffect } from "react";
import { FaCar, FaSpinner } from "react-icons/fa";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import StatusBadge from "../../../components/UI/StatusBadge";
import { apiPath } from "@/config/api";

const ChauffeurVehicleModal = ({ isOpen, onClose }) => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
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
      if (!token) {
        setError("Vous devez être connecté pour voir les informations du véhicule");
        return;
      }

      const response = await fetch(
        apiPath("/auth/chauffeur/profile"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Erreur ${response.status}`
        );
      }

      const data = await response.json();
      if (data.success && data.chauffeur?.vehicule) {
        setVehicle(data.chauffeur.vehicule);
      } else {
        setError("Aucun véhicule attribué");
      }
    } catch (e) {
      setError(e.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const rows = vehicle
    ? [
        ["Immatriculation", vehicle.immatriculation],
        ["Marque", vehicle.marque],
        ["Modèle", vehicle.modele],
        ["Catégorie", vehicle.categorie || "LIGHT"],
        [
          "Kilométrage",
          `${vehicle.kilometrage?.toLocaleString("fr-FR") ?? "—"} km`,
        ],
        ["Année", vehicle.annee || "N/A"],
      ]
    : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mon véhicule"
      icon={FaCar}
      size="md"
      footer={
        error ? (
          <Button variant="secondary" size="sm" onClick={fetchVehicleData}>
            Réessayer
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={onClose}>
            Fermer
          </Button>
        )
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
          Aucun véhicule attribué. Contactez l&apos;administrateur.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Statut</span>
            <StatusBadge
              variant={vehicle.statut === "attribué" ? "success" : "danger"}
              label={vehicle.statut === "attribué" ? "Attribué" : "Non attribué"}
            />
          </div>
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 last:border-0"
            >
              <span className="text-sm text-slate-500">{label}</span>
              <span className="text-sm font-medium text-slate-900">{value}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default ChauffeurVehicleModal;
