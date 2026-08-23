import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "./AuthShell";
import { apiPath } from "@/config/api";

const LoginAdmin = () => {
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
      const response = await fetch(apiPath("/admin/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        const adminUser = data.user || {
          id: data.admin?.id,
          email: data.admin?.email,
          role: "admin",
        };
        if (!adminUser.role) {
          adminUser.role = "admin";
        }

        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminUser", JSON.stringify(adminUser));
        if (data.admin) {
          localStorage.setItem("adminInfo", JSON.stringify(data.admin));
        }
        navigate("/admin");
      } else {
        setError(data.message || data.error || "Erreur de connexion");
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
      role="admin"
      title="Connexion administrateur"
      subtitle="Accédez à votre espace de gestion de flotte."
      emailPlaceholder="admin@exemple.com"
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

export default LoginAdmin;
