import React, { useState, useEffect } from "react";
import { FaExclamationTriangle, FaSync } from "react-icons/fa";
import MaintenancePageShell from "../components/Entretiens/MaintenancePageShell";
import MaintenanceTable from "../components/Entretiens/MaintenanceTable";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import Modal from "../components/UI/Modal";
import ToastNotification from "../components/UI/ToastNotification";
import { useMaintenanceVehicles } from "../hooks/useMaintenanceVehicles";
import {
  getUrgentMaintenance,
  formatMaintenanceData,
  fetchVehicles,
} from "../services/maintenanceService";
import { apiPath } from "@/config/api";

const TYPE_MAPPING = {
  "Catégorie A": "vidange",
  "Catégorie B": "categorie_b",
  "Catégorie C": "categorie_c",
};

const EntretiensUrgents = () => {
  const { vehicles, setVehicles, loading, error, reload } = useMaintenanceVehicles();
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingValidation, setPendingValidation] = useState(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    const urgent = getUrgentMaintenance(vehicles);
    setMaintenanceData(formatMaintenanceData(urgent));
  }, [vehicles]);

  const handleMaintenanceValidation = (vehiclePlate, maintenanceType) => {
    const backendType = TYPE_MAPPING[maintenanceType] || maintenanceType;
    setPendingValidation({ vehiclePlate, maintenanceType: backendType });
    setShowConfirmation(true);
  };

  const confirmValidation = async () => {
    if (!pendingValidation) return;

    setValidating(true);
    try {
      const vehicle = vehicles.find(
        (v) => v.immatriculation === pendingValidation.vehiclePlate
      );
      if (!vehicle) throw new Error("Véhicule non trouvé");

      const response = await fetch(apiPath("/admin/entretiens/validate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehiculeId: vehicle.id,
          type: pendingValidation.maintenanceType,
          kilometrage: vehicle.currentMileage || vehicle.kilometrage || 0,
          description: `Entretien ${pendingValidation.maintenanceType} validé`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la validation");
      }

      const updated = await fetchVehicles();
      setVehicles(updated);

      setShowConfirmation(false);
      setPendingValidation(null);
      setNotification({
        type: "success",
        message: "Entretien validé. Nouvelle estimation calculée.",
      });
    } catch (err) {
      setNotification({
        type: "error",
        message: err.message || "Erreur lors de la validation",
      });
    } finally {
      setValidating(false);
    }
  };

  return (
    <MaintenancePageShell
      title="Entretiens urgents"
      subtitle={`${maintenanceData.length} entretien(s) à traiter sous 7 jours`}
      icon={FaExclamationTriangle}
      loading={loading}
      error={error}
      actions={
        <Button variant="secondary" size="sm" icon={FaSync} onClick={reload}>
          Actualiser
        </Button>
      }
    >
      <Card padding={false} className="overflow-hidden">
        <MaintenanceTable
          data={maintenanceData}
          onComplete={handleMaintenanceValidation}
          emptyTitle="Aucun entretien urgent"
        />
      </Card>

      {notification && (
        <ToastNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <Modal
        show={showConfirmation}
        onClose={() => !validating && setShowConfirmation(false)}
        title="Confirmer la validation"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              disabled={validating}
              onClick={() => {
                setShowConfirmation(false);
                setPendingValidation(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={validating}
              onClick={confirmValidation}
            >
              Valider
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Valider l&apos;entretien{" "}
          <strong>{pendingValidation?.maintenanceType}</strong> pour le véhicule{" "}
          <strong>{pendingValidation?.vehiclePlate}</strong> ?
        </p>
      </Modal>
    </MaintenancePageShell>
  );
};

export default EntretiensUrgents;
