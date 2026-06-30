import { useState } from "react";
import { FaKey, FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import { apiPath } from "@/config/api";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const labelClass = "mb-1 block text-xs font-medium text-slate-600";

const FirstLoginPasswordModal = ({ isOpen, onSuccess }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("chauffeurToken");
      const response = await fetch(
        apiPath("/auth/chauffeur/personalize-password"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newPassword, confirmPassword }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la personnalisation");
      }

      localStorage.removeItem("chauffeurRequiresPasswordChange");

      const storedUser = localStorage.getItem("chauffeurUser");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        user.doitChangerMotDePasse = false;
        localStorage.setItem("chauffeurUser", JSON.stringify(user));
      }

      if (typeof onSuccess === "function") {
        onSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      closeOnOverlay={false}
      title="Personnalisez votre mot de passe"
      subtitle="Pour sécuriser votre compte, choisissez un mot de passe personnel avant d'accéder à l'application."
      icon={FaShieldAlt}
      size="md"
      footer={
        <Button
          variant="primary"
          size="sm"
          type="submit"
          form="first-login-password-form"
          loading={loading}
        >
          Enregistrer mon mot de passe
        </Button>
      }
    >
      <form
        id="first-login-password-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800">
          <FaKey className="mb-2 inline text-indigo-600" /> Utilisez le mot de
          passe temporaire reçu par email uniquement pour cette première
          connexion, puis définissez le vôtre ci-dessous.
        </div>

        <div>
          <label className={labelClass}>Nouveau mot de passe</label>
          <div className="flex items-center rounded-lg border border-slate-300 focus-within:ring-2 focus-within:ring-indigo-500">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="flex-1 rounded-lg border-0 px-3 py-2 text-sm focus:outline-none focus:ring-0"
              placeholder="Minimum 6 caractères"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="px-2 py-1.5 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>Confirmer le mot de passe</label>
          <div className="flex items-center rounded-lg border border-slate-300 focus-within:ring-2 focus-within:ring-indigo-500">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex-1 rounded-lg border-0 px-3 py-2 text-sm focus:outline-none focus:ring-0"
              placeholder="Répétez le mot de passe"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="px-2 py-1.5 text-slate-400 hover:text-slate-600"
            >
              {showConfirmPassword ? (
                <FaEyeSlash size={14} />
              ) : (
                <FaEye size={14} />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
};

export default FirstLoginPasswordModal;
