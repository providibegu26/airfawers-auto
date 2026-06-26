import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaCar } from "react-icons/fa";
import Modal from "../UI/Modal";
import Button from "../UI/Button";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const labelClass = "mb-1 block text-xs font-medium text-slate-600";

export const EditVehicleModal = ({ isOpen, vehicle, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    immatriculation: "",
    marque: "Toyota",
    modele: "",
    categorie: "LIGHT",
    kilometrage: "",
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        immatriculation: vehicle.immatriculation || "",
        marque: vehicle.marque || "Toyota",
        modele: vehicle.modele || "",
        categorie: vehicle.categorie || "LIGHT",
        kilometrage: vehicle.kilometrage || "",
      });
    }
  }, [vehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...vehicle,
      ...formData,
      kilometrage: Number(formData.kilometrage),
    });
  };

  if (!isOpen || !vehicle) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier véhicule"
      icon={FaCar}
      size="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="edit-vehicle-form"
          >
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="edit-vehicle-form" onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass}>Immatriculation *</label>
          <input
            type="text"
            name="immatriculation"
            value={formData.immatriculation}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Marque</label>
          <select
            name="marque"
            value={formData.marque}
            onChange={handleChange}
            className={inputClass}
          >
            <option>Toyota</option>
            <option>Renault</option>
            <option>Peugeot</option>
            <option>Mercedes</option>
            <option>BMW</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Modèle *</label>
          <input
            type="text"
            name="modele"
            value={formData.modele}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Catégorie</label>
          <select
            name="categorie"
            value={formData.categorie}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="LIGHT">LIGHT</option>
            <option value="HEAVY">HEAVY</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Kilométrage *</label>
          <input
            type="number"
            name="kilometrage"
            value={formData.kilometrage}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>
      </form>
    </Modal>
  );
};

EditVehicleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  vehicle: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
