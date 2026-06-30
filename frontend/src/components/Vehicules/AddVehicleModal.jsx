import { useState } from "react";
import { FaCar } from "react-icons/fa";
import Modal from "../UI/Modal";
import Button from "../UI/Button";

export const AddVehicleModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    immatriculation: "",
    marque: "Toyota",
    modele: "",
    categorie: "LIGHT",
    typeCarburant: "ESSENCE",
    kilometrage: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      immatriculation: form.immatriculation,
      marque: form.marque,
      modele: form.modele,
      categorie: form.categorie,
      typeCarburant: form.typeCarburant,
      kilometrage: Number(form.kilometrage),
      statut: "non attribué",
    });
  };

  const fields = [
    { label: "Immatriculation", name: "immatriculation", type: "text", required: true },
    {
      label: "Marque",
      name: "marque",
      type: "select",
      options: ["Toyota", "Renault", "Peugeot", "Mercedes", "BMW"],
    },
    { label: "Modèle", name: "modele", type: "text", required: true },
    { label: "Catégorie", name: "categorie", type: "select", options: ["LIGHT", "HEAVY"] },
    {
      label: "Type de carburant",
      name: "typeCarburant",
      type: "select",
      options: [
        { value: "ESSENCE", label: "Essence (2 440 FC/L)" },
        { value: "GASOIL", label: "Gasoil (2 430 FC/L)" },
      ],
    },
    { label: "Kilométrage", name: "kilometrage", type: "number", required: true },
  ];

  return (
    <Modal
      show
      onClose={onClose}
      title="Ajouter un véhicule"
      icon={FaCar}
      size="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" size="sm" type="submit" form="add-vehicle-form">
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="add-vehicle-form" onSubmit={handleSubmit} className="space-y-3">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              {field.label}
              {field.required && " *"}
            </label>
            {field.type === "select" ? (
              <select
                value={form[field.name]}
                onChange={(e) =>
                  setForm({ ...form, [field.name]: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {field.options.map((option) => {
                  const value = typeof option === "object" ? option.value : option;
                  const label = typeof option === "object" ? option.label : option;
                  return (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  );
                })}
              </select>
            ) : (
              <input
                type={field.type}
                value={form[field.name]}
                onChange={(e) =>
                  setForm({ ...form, [field.name]: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required={field.required}
              />
            )}
          </div>
        ))}
      </form>
    </Modal>
  );
};
