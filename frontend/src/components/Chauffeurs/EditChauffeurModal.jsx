import { useState, useEffect } from "react";
import { FaUserTie } from "react-icons/fa";
import PropTypes from "prop-types";
import Modal from "../UI/Modal";
import Button from "../UI/Button";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const labelClass = "mb-1 block text-xs font-medium text-slate-600";

export const EditChauffeurModal = ({ chauffeur, onClose, onUpdate }) => {
  const [form, setForm] = useState({
    nom: "",
    postnom: "",
    prenom: "",
    sexe: "Masculin",
    telephone: "",
    email: "",
  });

  useEffect(() => {
    if (chauffeur) {
      setForm({
        nom: chauffeur.nom || "",
        postnom: chauffeur.postnom || "",
        prenom: chauffeur.prenom || "",
        sexe: chauffeur.sexe || "Masculin",
        telephone: chauffeur.telephone || "",
        email: chauffeur.user?.email || "",
      });
    }
  }, [chauffeur]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ ...chauffeur, ...form });
  };

  const fields = [
    { label: "Nom", name: "nom", type: "text", required: true },
    { label: "Post-Nom", name: "postnom", type: "text", required: true },
    { label: "Prénom", name: "prenom", type: "text", required: true },
    {
      label: "Sexe",
      name: "sexe",
      type: "select",
      options: ["Masculin", "Féminin"],
      required: true,
    },
    { label: "Email", name: "email", type: "email", required: true },
    { label: "Téléphone", name: "telephone", type: "tel", required: true },
  ];

  return (
    <Modal
      show
      onClose={onClose}
      title="Modifier le chauffeur"
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
            type="submit"
            form="edit-chauffeur-form"
          >
            Enregistrer
          </Button>
        </>
      }
    >
      <form id="edit-chauffeur-form" onSubmit={handleSubmit} className="space-y-3">
        {fields.map((field) => (
          <div key={field.name}>
            <label className={labelClass}>
              {field.label}
              {field.required && "*"}
            </label>
            {field.type === "select" ? (
              <select
                value={form[field.name]}
                onChange={(e) =>
                  setForm({ ...form, [field.name]: e.target.value })
                }
                className={inputClass}
                required={field.required}
              >
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={form[field.name]}
                onChange={(e) =>
                  setForm({ ...form, [field.name]: e.target.value })
                }
                className={inputClass}
                required={field.required}
              />
            )}
          </div>
        ))}
      </form>
    </Modal>
  );
};

EditChauffeurModal.propTypes = {
  chauffeur: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};
