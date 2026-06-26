import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginChauffeur = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("email"); // email | setPassword | login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // 1. Vérifier l'email
  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) return setError("Veuillez entrer votre email.");
    try {
      const res = await fetch("http://localhost:4000/api/auth-chauffeur/chauffeur/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!data.exists) {
        setError("Aucun compte chauffeur trouvé avec cet email.");
      } else if (!data.motDePasseDefini) {
        setStep("setPassword");
      } else {
        setStep("login");
      }
    } catch (err) {
      setError("Erreur réseau");
    }
  };

  // 2. Définir le mot de passe à la première connexion
  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (!newPassword || !confirmPassword) return setError("Veuillez remplir les deux champs.");
    if (newPassword !== confirmPassword) return setError("Les mots de passe ne correspondent pas.");
    try {
      const res = await fetch("http://localhost:4000/api/auth-chauffeur/chauffeur/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, motDePasse: newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Mot de passe défini avec succès. Vous pouvez maintenant vous connecter.");
        setStep("login");
      } else {
        setError(data.error || "Erreur lors de la définition du mot de passe");
      }
    } catch (err) {
      setError("Erreur réseau");
    }
  };

  // 3. Login classique
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Veuillez remplir tous les champs.");
    try {
      const res = await fetch("http://localhost:4000/api/auth-chauffeur/chauffeur/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, motDePasse: password })
      });
      const data = await res.json();
      if (res.ok) {
        // Stocke l'id du chauffeur connecté pour les requêtes personnalisées
        if (data.user && data.user.chauffeur && data.user.chauffeur.id) {
          localStorage.setItem('chauffeurId', data.user.chauffeur.id);
        }
        // Stocke le token si besoin : localStorage.setItem('token', data.token)
        // Force un reload pour que le layout prenne bien en compte le localStorage
        window.location.href = "/chauffeur";
      } else {
        setError(data.error || "Erreur de connexion");
      }
    } catch (err) {
      setError("Erreur réseau");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-700">
          Connexion Chauffeur
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {step === "email" && (
          <form onSubmit={handleCheckEmail} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="chauffeur@airfawers.com"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              Continuer
            </button>
          </form>
        )}

        {step === "setPassword" && (
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="********"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="********"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              Définir mon mot de passe
            </button>
          </form>
        )}

        {step === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="chauffeur@airfawers.com"
                required
                disabled
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="********"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              Se connecter
            </button>
          </form>
        )}

        <p className="text-sm text-center mt-4 text-gray-600">
          Mot de passe oublié ?{" "}
          <a
            href="/auth/chauffeur/forgot-password"
            className="text-indigo-600 hover:underline"
          >
            Réinitialiser
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginChauffeur;
