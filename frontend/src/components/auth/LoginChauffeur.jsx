import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "./AuthShell";
import { apiPath } from "@/config/api";

const LoginChauffeur = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        apiPath("/auth/chauffeur/login"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("chauffeurToken", data.token);
        localStorage.setItem("chauffeurUser", JSON.stringify(data.user));
        navigate("/chauffeur");
      } else {
        setError(data.message || "Erreur de connexion");
        setLoading(false);
      }
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setError(
        "Erreur de connexion au serveur. Vérifiez que le serveur est démarré."
      );
      setLoading(false);
    }
  };

  return (
    <AuthShell
      role="chauffeur"
      title="Connexion chauffeur"
      subtitle="Accédez à votre espace personnel et à vos missions."
      emailPlaceholder="chauffeur@airfawers.com"
      email={email}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
    />
  );
};

export default LoginChauffeur;
