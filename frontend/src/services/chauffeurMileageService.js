import { apiPath } from "@/config/api";

const API = apiPath("/chauffeur/kilometrage");

const authHeaders = () => {
  const token = localStorage.getItem("chauffeurToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchChauffeurMileageStatus = async () => {
  const res = await fetch(`${API}/statut`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur statut kilométrage");
  return data;
};

export const submitChauffeurMileage = async (newMileage) => {
  const res = await fetch(API, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ newMileage }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur lors de la saisie");
  return data;
};
