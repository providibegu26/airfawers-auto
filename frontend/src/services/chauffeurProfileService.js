import { apiPath } from "@/config/api";

const API = apiPath("/auth/chauffeur/profile");

export async function fetchChauffeurProfile() {
  const token = localStorage.getItem("chauffeurToken");
  if (!token) throw new Error("Session expirée");

  const response = await fetch(API, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Impossible de charger le profil");
  }

  return data.chauffeur;
}

export function vehicleToCalendarFormat(vehicule) {
  if (!vehicule) return [];

  return [
    {
      ...vehicule,
      currentMileage: vehicule.kilometrage || 0,
      weeklyKm: vehicule.weeklyKm || 500,
    },
  ];
}

export function getChauffeurDisplayName(chauffeur, fallback = "Chauffeur") {
  if (!chauffeur) return fallback;
  const prenom = chauffeur.prenom || "";
  const nom = chauffeur.nom || "";
  if (prenom && nom) return `${prenom} ${nom}`;
  return prenom || nom || chauffeur.email || fallback;
}
