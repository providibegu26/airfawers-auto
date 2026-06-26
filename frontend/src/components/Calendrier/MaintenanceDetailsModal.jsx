import React from "react";
import {
  FaCalendarAlt,
  FaCar,
  FaUser,
  FaTools,
  FaExclamationTriangle,
} from "react-icons/fa";
import Modal from "../UI/Modal";
import ModalCard from "../UI/ModalCard";
import Button from "../UI/Button";
import StatusBadge from "../UI/StatusBadge";

const urgencyVariant = (days) => {
  if (days <= 7) return "danger";
  if (days <= 14) return "warning";
  return "success";
};

const TYPE_LABELS = {
  vidange: "Catégorie A",
  categorie_b: "Catégorie B",
  categorie_c: "Catégorie C",
};

const MaintenanceDetailsModal = ({ isOpen, onClose, date, entretiens }) => {
  if (!entretiens?.length) return null;

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const title = date
    ? `Entretiens du ${formatDate(date)}`
    : "Entretiens prévus";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={FaCalendarAlt}
      size="lg"
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          Fermer
        </Button>
      }
    >
      <div className="space-y-3">
        {entretiens.map((entretien, index) => (
          <ModalCard key={`${entretien.vehicle?.immatriculation}-${index}`}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FaCar className="text-indigo-600" />
                <span className="font-medium text-slate-900">
                  {entretien.vehicle.immatriculation}
                </span>
              </div>
              <StatusBadge
                variant={urgencyVariant(entretien.daysRemaining)}
                label={`${entretien.daysRemaining} jour(s)`}
              />
            </div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
              <FaTools className="text-slate-400" />
              {TYPE_LABELS[entretien.type] || entretien.type}
            </div>
            <div className="space-y-1 text-xs text-slate-500">
              <p>
                {entretien.vehicle.marque} {entretien.vehicle.modele}
              </p>
              {entretien.vehicle.chauffeur ? (
                <>
                  <p className="flex items-center gap-1 text-slate-600">
                    <FaUser className="text-slate-400" />
                    {entretien.vehicle.chauffeur.nom}{" "}
                    {entretien.vehicle.chauffeur.prenom}
                  </p>
                </>
              ) : (
                <p className="flex items-center gap-1">
                  <FaUser className="text-slate-400" />
                  Chauffeur non attribué
                </p>
              )}
            </div>
            {entretien.daysRemaining <= 7 && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                <FaExclamationTriangle />
                Entretien urgent — à programmer rapidement
              </div>
            )}
          </ModalCard>
        ))}

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          <p className="font-medium text-slate-800">Résumé</p>
          <p className="mt-1">
            {entretiens.length} entretien(s) —{" "}
            {entretiens.filter((e) => e.daysRemaining <= 7).length} urgent(s)
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default MaintenanceDetailsModal;
