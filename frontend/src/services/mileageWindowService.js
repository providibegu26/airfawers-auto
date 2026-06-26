import { apiPath } from "@/config/api";

const API = apiPath("/admin/kilometrage");

export const fetchMileageWindowStatus = async () => {
  const res = await fetch(`${API}/fenetre`);
  if (!res.ok) throw new Error("Impossible de charger le statut kilométrage");
  return res.json();
};

export const openMileageWindow = async () => {
  const res = await fetch(`${API}/fenetre/ouvrir`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur lors de l'ouverture");
  return data;
};

export const closeMileageWindow = async () => {
  const res = await fetch(`${API}/fenetre/fermer`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur lors de la fermeture");
  return data;
};
