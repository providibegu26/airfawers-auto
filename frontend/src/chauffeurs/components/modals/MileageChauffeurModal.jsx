import React, { useEffect, useState } from "react";
import { FaTachometerAlt, FaCalculator, FaCar } from "react-icons/fa";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import {
  fetchChauffeurMileageStatus,
  submitChauffeurMileage,
} from "../../../services/chauffeurMileageService";

const MileageChauffeurModal = ({ isOpen, onClose, onSuccess }) => {
  const [status, setStatus] = useState(null);
  const [newMileage, setNewMileage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setNewMileage("");
    setError("");
    setLoading(true);
    fetchChauffeurMileageStatus()
      .then(setStatus)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const previousMileage = status?.vehicule?.kilometrage ?? 0;
  const weeklyKm =
    newMileage && Number(newMileage) > previousMileage
      ? Number(newMileage) - previousMileage
      : 0;

  const handleSubmit = async () => {
    setError("");
    if (!status?.peutSaisir) {
      setError("Saisie non autorisée pour le moment");
      return;
    }
    if (!newMileage || Number(newMileage) <= previousMileage) {
      setError("Le kilométrage doit être supérieur au relevé précédent");
      return;
    }

    setSubmitting(true);
    try {
      await submitChauffeurMileage(Number(newMileage));
      onSuccess?.();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const footer = status?.peutSaisir ? (
    <>
      <Button variant="secondary" size="sm" disabled={submitting} onClick={onClose}>
        Annuler
      </Button>
      <Button
        variant="primary"
        size="sm"
        loading={submitting}
        disabled={!newMileage || weeklyKm <= 0}
        onClick={handleSubmit}
      >
        Valider
      </Button>
    </>
  ) : (
    <Button variant="secondary" size="sm" onClick={onClose}>
      Fermer
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mettre à jour le kilométrage"
      subtitle="Relevé de votre véhicule à chaque autorisation de l'administrateur"
      icon={FaTachometerAlt}
      size="md"
      footer={!loading ? footer : null}
    >
      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">Chargement…</p>
      ) : !status?.vehicule ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Aucun véhicule ne vous est attribué.
        </p>
      ) : !status.fenetreOuverte ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          L&apos;administrateur n&apos;a pas encore autorisé la mise à jour du
          kilométrage.
        </p>
      ) : status.dejaSaisi ? (
        <div className="space-y-2 text-sm text-slate-600">
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
            Kilométrage déjà enregistré pour cette autorisation (
            {status.saisie?.kmParcourus?.toLocaleString("fr-FR")} km parcourus).
            Vous pourrez à nouveau le mettre à jour à la prochaine autorisation
            de l&apos;administrateur.
          </p>
          <p>
            Véhicule : <strong>{status.vehicule.immatriculation}</strong> —{" "}
            {status.vehicule.kilometrage?.toLocaleString("fr-FR")} km
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <FaCar className="text-indigo-500" />
            {status.vehicule.marque} {status.vehicule.modele} —{" "}
            {status.vehicule.immatriculation}
          </p>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Kilométrage actuel (compteur)
            </label>
            <input
              type="number"
              value={newMileage}
              onChange={(e) => setNewMileage(e.target.value)}
              placeholder={`Supérieur à ${previousMileage.toLocaleString("fr-FR")}`}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
            <div className="mb-2 flex items-center gap-2 font-medium text-slate-700">
              <FaCalculator className="text-slate-400" />
              Calcul automatique
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Relevé précédent</span>
              <span className="tabular-nums font-medium">
                {previousMileage.toLocaleString("fr-FR")} km
              </span>
            </div>
            {weeklyKm > 0 && (
              <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-semibold text-indigo-700">
                <span>Distance cette semaine</span>
                <span className="tabular-nums">
                  {weeklyKm.toLocaleString("fr-FR")} km
                </span>
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
};

export default MileageChauffeurModal;
