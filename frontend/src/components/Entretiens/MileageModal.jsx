import { useState, useEffect } from "react";
import { FaTachometerAlt, FaCar, FaCalculator } from "react-icons/fa";
import Modal from "../UI/Modal";
import Button from "../UI/Button";

const MileageModal = ({ show, onClose, vehicles, onMileageUpdate }) => {
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [currentMileage, setCurrentMileage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show) {
      setSelectedVehicle("");
      setCurrentMileage("");
      setError(null);
    }
  }, [show]);

  const calculateWeeklyKm = () => {
    if (!selectedVehicle || !currentMileage) return 0;
    const vehicle = vehicles.find((v) => v.immatriculation === selectedVehicle);
    if (!vehicle) return 0;
    const previousMileage = vehicle.currentMileage || vehicle.kilometrage || 0;
    const weeklyKm = parseInt(currentMileage, 10) - previousMileage;
    return weeklyKm > 0 ? weeklyKm : 0;
  };

  const handleSubmit = async () => {
    if (!selectedVehicle) {
      setError("Veuillez sélectionner un véhicule");
      return;
    }
    if (!currentMileage || currentMileage <= 0) {
      setError("Veuillez saisir un kilométrage valide");
      return;
    }
    const weeklyKm = calculateWeeklyKm();
    if (weeklyKm <= 0) {
      setError(
        "Le nouveau kilométrage doit être supérieur au kilométrage précédent"
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onMileageUpdate(
        selectedVehicle,
        parseInt(currentMileage, 10)
      );
      onClose();
    } catch {
      setError("Erreur lors de la mise à jour du kilométrage");
    } finally {
      setLoading(false);
    }
  };

  const weeklyKm = calculateWeeklyKm();
  const selectedVehicleData = vehicles.find(
    (v) => v.immatriculation === selectedVehicle
  );
  const previousMileage = selectedVehicleData
    ? selectedVehicleData.currentMileage ||
      selectedVehicleData.kilometrage ||
      0
    : 0;

  const canSubmit =
    selectedVehicle && currentMileage > 0 && weeklyKm > 0 && !loading;

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Mise à jour kilométrage"
      subtitle="Saisie du kilométrage actuel"
      icon={FaTachometerAlt}
      size="md"
      footer={
        <>
          <Button variant="secondary" size="sm" disabled={loading} onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={loading}
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            Valider
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="vehicle-select"
            className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"
          >
            <FaCar className="text-slate-400" />
            Véhicule
          </label>
          <select
            id="vehicle-select"
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Sélectionner un véhicule</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.immatriculation}>
                {vehicle.immatriculation} — {vehicle.marque} {vehicle.modele}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="current-mileage"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Kilométrage actuel (km)
          </label>
          <input
            type="number"
            id="current-mileage"
            value={currentMileage}
            onChange={(e) => setCurrentMileage(e.target.value)}
            placeholder="Ex. 10500"
            min="1"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {selectedVehicle && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <FaCalculator className="text-slate-400" />
              Calcul automatique
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Kilométrage précédent</span>
                <span className="font-medium tabular-nums">
                  {previousMileage.toLocaleString("fr-FR")} km
                </span>
              </div>
              {currentMileage && (
                <>
                  <div className="flex justify-between">
                    <span>Kilométrage actuel</span>
                    <span className="font-medium tabular-nums">
                      {parseInt(currentMileage, 10).toLocaleString("fr-FR")} km
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold text-indigo-700">
                    <span>Distance cette semaine</span>
                    <span className="tabular-nums">
                      {weeklyKm.toLocaleString("fr-FR")} km
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
};

export default MileageModal;
