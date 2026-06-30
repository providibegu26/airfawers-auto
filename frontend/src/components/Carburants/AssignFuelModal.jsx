import { FaCheck, FaGasPump } from "react-icons/fa";
import { useState, useMemo } from "react";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import { apiPath } from "@/config/api";
import { getFuelLabel, getPrixLitre } from "@/config/fuelPrices";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const labelClass = "mb-1 block text-xs font-medium text-slate-600";

const AssignFuelModal = ({ show, onClose, vehicle, onSuccess }) => {
  const coef =
    (vehicle?.categorie || "LIGHT").toUpperCase() === "HEAVY" ? 0.2 : 0.08;
  const weeklyKm = vehicle?.weeklyKm || 0;
  const estLitres = weeklyKm * coef;
  const minLitres = estLitres * 0.9;
  const maxLitres = estLitres * 1.1;
  const typeCarburant = vehicle?.typeCarburant || "ESSENCE";
  const prixFC = getPrixLitre(typeCarburant);
  const coutFC = estLitres * prixFC;

  const [quantity, setQuantity] = useState("");
  const parsedQty = useMemo(() => {
    const n = parseFloat(quantity);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [quantity]);

  const coutSaisiFC = useMemo(
    () => Math.round(parsedQty * prixFC),
    [parsedQty]
  );
  const formatFc = (n) => `${n.toLocaleString("fr-FR")} FC`;

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      if (!vehicle?.id) throw new Error("Véhicule invalide");
      if (!parsedQty || parsedQty <= 0)
        throw new Error("Veuillez saisir une quantité valide");
      setSubmitting(true);

      const payload = {
        vehiculeId: vehicle.id,
        quantite: parsedQty,
        estimation: estLitres,
        marge: 0.1,
        notes: null,
      };

      const res = await fetch(apiPath("/admin/carburant/attribuer"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Erreur lors de l'attribution");

      if (typeof onSuccess === "function") {
        await onSuccess();
      }
      onClose();
    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Attribuer du carburant"
      icon={FaGasPump}
      size="md"
      footer={
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={FaCheck}
            onClick={handleSubmit}
            loading={submitting}
          >
            Valider
          </Button>
        </>
      }
    >
      {vehicle && (
        <div className="mb-4 rounded-lg bg-slate-50 p-3">
          <h4 className="mb-2 font-medium text-slate-700">
            Véhicule sélectionné
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500">Immatriculation</p>
              <p className="text-sm font-medium">
                {vehicle.immatriculation || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Marque/Modèle</p>
              <p className="text-sm font-medium">
                {vehicle.marque && vehicle.modele
                  ? `${vehicle.marque} ${vehicle.modele}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Conducteur</p>
              <p className="text-sm font-medium">
                {vehicle.chauffeur
                  ? `${vehicle.chauffeur.prenom} ${vehicle.chauffeur.nom}`
                  : "Non assigné"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Carburant</p>
              <p className="text-sm font-medium">
                {getFuelLabel(typeCarburant)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Dernier ravitail.</p>
              <p className="text-sm font-medium">-</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
          <p className="text-sm text-indigo-800">
            Estimation hebdo. pour ce véhicule:
            <span className="font-semibold"> {estLitres.toFixed(1)} L</span>{" "}
            (plage conseillée
            <span className="font-medium">
              {" "}
              {minLitres.toFixed(1)}–{maxLitres.toFixed(1)} L
            </span>
            )
          </p>
          <p className="mt-1 text-xs text-indigo-700">
            Catégorie: {String(vehicle?.categorie || "LIGHT")} • Carburant:{" "}
            {getFuelLabel(typeCarburant)} • Km/sem: {weeklyKm} • Coût estimé:{" "}
            {coutFC.toFixed(0)} FC
          </p>
        </div>

        <div>
          <label className={labelClass}>Quantité de carburant (L)</label>
          <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
            <span>Prix unitaire: {formatFc(prixFC)}</span>
            <span>
              Coût:{" "}
              <span className="font-medium text-slate-700">
                {formatFc(coutSaisiFC)}
              </span>
            </span>
          </div>
          <input
            type="number"
            className={inputClass}
            placeholder={`Ex: ${estLitres.toFixed(1)}`}
            min="0"
            step="0.1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          {submitError && (
            <p className="mt-2 text-xs text-red-600">{submitError}</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AssignFuelModal;
