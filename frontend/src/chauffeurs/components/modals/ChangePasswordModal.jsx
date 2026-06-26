import { useState } from "react";
import {
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import { apiPath } from "@/config/api";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const labelClass = "mb-1 block text-xs font-medium text-slate-600";

const ChangePasswordModal = ({ isOpen, onClose, userEmail }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(userEmail || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const handleRequestCode = async () => {
    if (!email) {
      setError("Veuillez entrer votre email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        apiPath("/auth/chauffeur/password-change/request"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setCodeSent(true);
        setSuccess(
          codeSent
            ? "Code renvoyé avec succès !"
            : "Code de confirmation envoyé par email !"
        );
        if (!codeSent) {
          setStep(2);
        }
      } else {
        setError(data.error || "Erreur lors de l'envoi du code");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmChange = async () => {
    if (!code || !newPassword || !confirmPassword) {
      setError("Tous les champs sont requis");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        apiPath("/auth/chauffeur/password-change/confirm"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code, newPassword }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess("Mot de passe modifié avec succès !");
        setTimeout(() => {
          onClose();
          localStorage.removeItem("chauffeurToken");
          window.location.href = "/login-chauffeur";
        }, 2000);
      } else {
        setError(
          data.error || "Erreur lors de la modification du mot de passe"
        );
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const stepFooter =
    step === 1 ? (
      <>
        <Button variant="secondary" size="sm" onClick={onClose}>
          Annuler
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleRequestCode}
          loading={loading}
        >
          {codeSent ? "Renvoyer le code" : "Demander le code"}
        </Button>
        {codeSent && (
          <Button variant="primary" size="sm" onClick={() => setStep(2)}>
            Continuer
          </Button>
        )}
      </>
    ) : (
      <>
        <Button variant="secondary" size="sm" onClick={() => setStep(1)}>
          Retour
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleConfirmChange}
          loading={loading}
        >
          Confirmer
        </Button>
      </>
    );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === 1 ? "Modifier le mot de passe" : "Confirmer le changement"
      }
      icon={FaShieldAlt}
      size="md"
      footer={stepFooter}
    >
      <div className="mb-3 text-center">
        <div className="flex items-center justify-center space-x-2">
          <span
            className={`rounded-full px-2 py-1 text-xs ${
              step === 1
                ? "border border-indigo-200 bg-indigo-50 text-indigo-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            Étape 1: Demande de code
            {codeSent && step === 1 && (
              <FaCheckCircle className="ml-1 inline text-green-500" />
            )}
          </span>
          <span className="text-slate-300">→</span>
          <span
            className={`rounded-full px-2 py-1 text-xs ${
              step === 2
                ? "border border-green-200 bg-green-50 text-green-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            Étape 2: Confirmation
          </span>
        </div>
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-indigo-50 p-3 text-center">
            <FaKey className="mb-2 text-lg text-indigo-600" />
            <p className="text-sm leading-tight text-slate-600">
              Nous allons vous envoyer un code de confirmation par email pour
              sécuriser le changement de mot de passe.
            </p>
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="votre@email.com"
              disabled={codeSent}
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <FaExclamationTriangle className="text-sm text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {success && !error && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {success}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg bg-green-50 p-2 text-center">
            <FaCheckCircle className="mb-1 text-base text-green-600" />
            <p className="text-xs leading-tight text-slate-600">
              Code envoyé ! Entrez le code reçu et votre nouveau mot de passe.
            </p>
          </div>

          <div>
            <label className={labelClass}>Code de confirmation</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`${inputClass} text-center font-mono tracking-widest`}
              placeholder="000000"
              maxLength={6}
            />
            <p className="mt-1 text-center text-xs text-slate-500">
              Code à 6 chiffres reçu par email
            </p>
          </div>

          <div>
            <label className={labelClass}>Nouveau mot de passe</label>
            <div className="flex items-center rounded-lg border border-slate-300 focus-within:ring-2 focus-within:ring-indigo-500">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 rounded-lg border-0 px-3 py-2 text-sm focus:outline-none focus:ring-0"
                placeholder="Nouveau mot de passe"
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
                placeholder="Confirmer le mot de passe"
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
            <div className="flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 p-2">
              <FaExclamationTriangle className="text-xs text-red-500" />
              <span className="text-xs text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 rounded-lg border border-green-200 bg-green-50 p-2">
              <FaCheckCircle className="text-xs text-green-500" />
              <span className="text-xs text-green-700">{success}</span>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ChangePasswordModal;
