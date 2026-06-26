// src/Pages/auth/LoginAdmin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import { useAuth } from "../../context/AuthContext";

const LoginAdmin = () => {
  //const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Données simulées
    const adminEmail = "admin@airfawers.com";
    const adminPassword = "admin123";

    if (email === adminEmail && password === adminPassword) {
      //login("admin"); // ✅ ici seulement
      localStorage.setItem("adminToken", "faketoken123");
      navigate('/admin'); // ✅ va vers le bon dashboard
    } else {
      setError("Identifiants incorrects. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-700">Connexion Admin</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@airfawers.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">Mot de passe</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginAdmin;
