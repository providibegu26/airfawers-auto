import React, { useState, useEffect } from "react";
import { FaGasPump, FaSpinner } from "react-icons/fa";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import { apiPath } from "@/config/api";

const FuelModal = ({ isOpen, onClose }) => {
  const [fuelData, setFuelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCollected, setIsCollected] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) fetchFuelData();
  }, [isOpen]);

  const getCurrentWeek = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil(days / 7);
    return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, "0")}`;
  };

  const getWeekFromDate = (date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil(days / 7);
    return `${date.getFullYear()}-W${weekNumber.toString().padStart(2, "0")}`;
  };

  const fetchFuelData = async () => {
    setLoading(true);
    setError("");
    setFuelData(null);
    setIsCollected(false);

    try {
      const token = localStorage.getItem("chauffeurToken");
      if (!token) throw new Error("Session expirée");

      const profileResponse = await fetch(
        apiPath("/auth/chauffeur/profile"),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!profileResponse.ok) throw new Error("Erreur profil");

      const profileData = await profileResponse.json();
      if (!profileData.success || !profileData.chauffeur?.vehicule) {
        throw new Error("Aucun véhicule attribué");
      }

      const vehicleId = profileData.chauffeur.vehicule.id;
      const fuelResponse = await fetch(
        apiPath(`/chauffeur/carburant/historique/vehicule/${vehicleId}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!fuelResponse.ok) throw new Error("Erreur carburant");

      const fuelResponseData = await fuelResponse.json();
      const fuelHistory = fuelResponseData.attributions || [];
      const currentWeek = getCurrentWeek();
      const currentAttribution = fuelHistory.find((a) => {
        const d = new Date(a.date);
        return getWeekFromDate(d) === currentWeek;
      });

      if (currentAttribution) {
        const collectedKey = `fuel_collected_${currentAttribution.id}`;
        setFuelData({
          ...currentAttribution,
          vehicle: profileData.chauffeur.vehicule,
        });
        setIsCollected(localStorage.getItem(collectedKey) === "true");
      } else {
        setFuelData({
          vehicle: profileData.chauffeur.vehicule,
          noAttribution: true,
        });
      }
    } catch (e) {
      setError(e.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const confirmCollection = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("chauffeurToken");
      const profileResponse = await fetch(
        apiPath("/auth/chauffeur/profile"),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const profileData = await profileResponse.json();
      const chauffeurId = profileData.chauffeur.id;

      const response = await fetch(
        apiPath("/chauffeur/carburant/confirmer-recuperation"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            attributionCarburantId: fuelData.id,
            quantite: fuelData.quantite,
            chauffeurId,
            notes: "Carburant récupéré avec succès",
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erreur confirmation");
      }

      localStorage.setItem(`fuel_collected_${fuelData.id}`, "true");
      setIsCollected(true);
      setShowConfirmation(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const canCollect =
    fuelData && !fuelData.noAttribution && !isCollected && !loading && !error;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Carburant de la semaine"
        icon={FaGasPump}
        size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Fermer
            </Button>
            {canCollect && (
              <Button
                variant="primary"
                size="sm"
                loading={submitting}
                onClick={() => setShowConfirmation(true)}
              >
                Valider la récupération
              </Button>
            )}
          </>
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
        ) : fuelData?.noAttribution ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Aucun carburant attribué cette semaine.
          </div>
        ) : fuelData ? (
          <div className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Véhicule</span>
                <span className="font-medium text-slate-900">
                  {fuelData.vehicle.marque} {fuelData.vehicle.modele}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Immatriculation</span>
                <span className="font-medium text-slate-900">
                  {fuelData.vehicle.immatriculation}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Quantité</p>
                <p className="text-lg font-semibold tabular-nums text-emerald-600">
                  {fuelData.quantite} L
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Date</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(fuelData.date).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
            {isCollected && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Récupération déjà confirmée pour cette attribution.
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={showConfirmation}
        onClose={() => !submitting && setShowConfirmation(false)}
        title="Confirmer la récupération"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              disabled={submitting}
              onClick={() => setShowConfirmation(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={submitting}
              onClick={confirmCollection}
            >
              Confirmer
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Confirmez-vous avoir reçu{" "}
          <strong>{fuelData?.quantite} L</strong> de carburant ?
        </p>
      </Modal>
    </>
  );
};

export default FuelModal;
