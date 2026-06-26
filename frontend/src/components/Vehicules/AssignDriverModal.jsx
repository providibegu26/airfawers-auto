import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaUserTie } from "react-icons/fa";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import { apiPath } from "@/config/api";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const labelClass = "mb-1 block text-xs font-medium text-slate-600";

export const AssignDriverModal = ({ isOpen, vehicle, onClose, onAssign }) => {
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [availableDrivers, setAvailableDrivers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetch(apiPath("/admin/chauffeurs"))
        .then((res) => res.json())
        .then((data) => {
          fetch(apiPath("/admin/vehicules"))
            .then((res2) => res2.json())
            .then((data2) => {
              const vehicules = data2.vehicules || [];
              const chauffeursAvecVehicule = new Set(
                vehicules.filter((v) => v.chauffeurId).map((v) => v.chauffeurId)
              );
              const filtered = (data.chauffeurs || []).filter(
                (c) =>
                  !chauffeursAvecVehicule.has(c.id) ||
                  (vehicle && c.id === vehicle.chauffeurId)
              );
              setAvailableDrivers(filtered);
            });
        });
    }
  }, [isOpen, vehicle]);

  if (!isOpen || !vehicle) return null;

  const handleAssign = () => {
    if (selectedDriverId) {
      onAssign(selectedDriverId);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Attribuer un chauffeur"
      subtitle={`${vehicle.marque} ${vehicle.modele}`}
      icon={FaUserTie}
      size="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAssign}
            disabled={!selectedDriverId}
          >
            Attribuer
          </Button>
        </>
      }
    >
      <div>
        <label className={labelClass}>Chauffeur disponible</label>
        <select
          value={selectedDriverId}
          onChange={(e) => setSelectedDriverId(e.target.value)}
          className={inputClass}
        >
          <option value="">Sélectionnez un chauffeur</option>
          {availableDrivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.prenom} {driver.nom}
            </option>
          ))}
        </select>
      </div>
    </Modal>
  );
};

AssignDriverModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  vehicle: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onAssign: PropTypes.func.isRequired,
};
