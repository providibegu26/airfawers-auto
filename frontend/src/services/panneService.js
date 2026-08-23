import { apiPath } from "@/config/api";
import { adminFetch } from "@/config/adminApi";

function getChauffeurAuthHeaders() {
  const token = localStorage.getItem("chauffeurToken");
  if (!token) throw new Error("Session expirée. Veuillez vous reconnecter.");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchPanneMeta() {
  const response = await fetch(apiPath("/pannes/meta"));
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Impossible de charger les options de signalement");
  }
  return data;
}

export async function fetchChauffeurProfile() {
  const response = await fetch(apiPath("/auth/chauffeur/profile"), {
    headers: getChauffeurAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Erreur lors de la récupération du profil");
  }
  return data;
}

export async function reportPanne({
  type,
  description,
  niveauGravite,
  latitude,
  longitude,
  localisation,
}) {
  const response = await fetch(apiPath("/chauffeur/pannes"), {
    method: "POST",
    headers: getChauffeurAuthHeaders(),
    body: JSON.stringify({
      type,
      description,
      niveauGravite,
      latitude,
      longitude,
      localisation,
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Erreur lors du signalement");
  }
  return data;
}

export async function fetchChauffeurPannes() {
  const response = await fetch(apiPath("/chauffeur/pannes"), {
    headers: getChauffeurAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Erreur lors de la récupération des signalements");
  }
  return data.pannes;
}

// --- Admin ---

export async function fetchAllPannes(statut) {
  const url = statut
    ? `/admin/pannes?statut=${encodeURIComponent(statut)}`
    : "/admin/pannes";
  const response = await adminFetch(url);
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Erreur lors du chargement des pannes");
  }
  return data.pannes;
}

export async function fetchPanneStats() {
  const response = await adminFetch("/admin/pannes/stats");
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Erreur lors du chargement des statistiques");
  }
  return data.stats;
}

export async function fetchPannesMap() {
  const response = await adminFetch("/admin/pannes/map");
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Erreur lors du chargement de la carte");
  }
  return data.pannes;
}

export async function updatePanneStatut(id, statut, notesAdmin) {
  const response = await adminFetch(`/admin/pannes/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ statut, notesAdmin }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Erreur lors de la mise à jour");
  }
  return data;
}
