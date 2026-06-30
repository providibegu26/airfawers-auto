import { useState, useCallback } from "react";
import { FaUserTie, FaEye, FaEyeSlash } from "react-icons/fa";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import ConfirmationModal from "../UI/ConfirmationModal";
import { apiPath } from "@/config/api";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const labelClass = "mb-1 block text-xs font-medium text-slate-600";

const EMPTY_FORM = {
  nom: "",
  postnom: "",
  prenom: "",
  email: "",
  telephone: "",
  sexe: "Masculin",
};

function formHasData(form) {
  return Object.entries(form).some(
    ([key, value]) => key !== "sexe" && String(value).trim() !== ""
  );
}

export const AddChauffeurModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      const response = await fetch(apiPath("/auth/chauffeur/create"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess({
          message: data.message,
          emailSent: data.emailSent !== false,
          credentials: data.credentials,
        });
        setShowCredentials(true);
        if (onSave) {
          onSave(data.chauffeur);
        }
      } else {
        setError(data.message || "Erreur lors de la création du chauffeur");
      }
    } catch {
      setError(
        "Erreur de connexion au serveur. Vérifiez que le serveur backend est démarré."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const requestClose = useCallback(() => {
    if (success) {
      onClose();
      return;
    }
    if (formHasData(form)) {
      setShowCancelConfirm(true);
      return;
    }
    onClose();
  }, [success, form, onClose]);

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    onClose();
  };

  return (
    <>
      <Modal
        show
        onClose={requestClose}
        title={success ? "Chauffeur créé" : "Ajouter chauffeur"}
        icon={FaUserTie}
        size="md"
        footer={
          success ? (
            <Button variant="primary" size="sm" onClick={onClose}>
              Fermer
            </Button>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={requestClose}>
                Annuler
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                form="add-chauffeur-form"
                loading={loading}
              >
                Créer
              </Button>
            </>
          )
        }
      >
        {!success ? (
          <form
            id="add-chauffeur-form"
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            {[
              { label: "Nom", field: "nom", type: "text" },
              { label: "Post-nom", field: "postnom", type: "text" },
              { label: "Prénom", field: "prenom", type: "text" },
              { label: "Email", field: "email", type: "email" },
              { label: "Téléphone", field: "telephone", type: "tel" },
            ].map(({ label, field, type }) => (
              <div key={field}>
                <label className={labelClass}>{label} *</label>
                <input
                  type={type}
                  value={form[field]}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            ))}

            <div>
              <label className={labelClass}>Sexe *</label>
              <select
                value={form.sexe}
                onChange={(e) => handleInputChange("sexe", e.target.value)}
                className={inputClass}
                required
              >
                <option value="Masculin">Masculin</option>
                <option value="Féminin">Féminin</option>
              </select>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-2 text-xs text-red-600">
                {error}
              </div>
            )}
          </form>
        ) : (
          <div className="space-y-3">
            <div
              className={`rounded-lg p-2 text-xs ${
                success.emailSent
                  ? "bg-green-50 text-green-600"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {success.message}
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <h4 className="mb-2 text-sm font-medium text-slate-900">
                Identifiants :
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-xs font-medium text-slate-700">
                    Email :
                  </span>
                  <span className="ml-2 text-xs text-slate-900">
                    {success.credentials.email}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-700">
                    Mot de passe :
                  </span>
                  <div className="mt-1 flex items-center">
                    <span className="font-mono text-xs text-slate-900">
                      {showCredentials
                        ? success.credentials.password
                        : "••••••••"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCredentials(!showCredentials)}
                      className="ml-2 text-slate-500 hover:text-slate-700"
                    >
                      {showCredentials ? (
                        <FaEyeSlash size={12} />
                      ) : (
                        <FaEye size={12} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-2 rounded bg-orange-50 p-2 text-xs text-orange-600">
                {success.emailSent
                  ? "Un email a été envoyé au chauffeur. Conservez aussi ces identifiants."
                  : "Communiquez ces identifiants au chauffeur manuellement."}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={confirmCancel}
        title="Annuler l'ajout"
        message="Voulez-vous vraiment annuler ? Les données saisies seront perdues."
        confirmText="Oui, annuler"
        cancelText="Continuer la saisie"
        variant="danger"
      />
    </>
  );
};
