import { adminFetch } from "@/config/adminApi";

const API_BASE = "/admin";

export const fetchChauffeurs = async () => {
  try {
    const response = await adminFetch(`${API_BASE}/chauffeurs`);
    const data = await response.json();

    if (data.success) {
      return data.chauffeurs;
    }
    throw new Error(data.error || "Erreur lors de la récupération des chauffeurs");
  } catch (error) {
    console.error("Erreur fetchChauffeurs:", error);
    throw error;
  }
};

export const createChauffeur = async (chauffeurData) => {
  try {
    const response = await adminFetch(`${API_BASE}/chauffeurs/create`, {
      method: "POST",
      body: JSON.stringify(chauffeurData),
    });

    const data = await response.json();

    if (data.success) {
      return data.chauffeur;
    }
    throw new Error(data.error || data.message || "Erreur lors de la création du chauffeur");
  } catch (error) {
    console.error("Erreur createChauffeur:", error);
    throw error;
  }
};

export const updateChauffeur = async (id, chauffeurData) => {
  try {
    const response = await adminFetch(`${API_BASE}/chauffeurs/${id}`, {
      method: "PUT",
      body: JSON.stringify(chauffeurData),
    });

    const data = await response.json();

    if (data.success) {
      return data.chauffeur;
    }
    throw new Error(data.error || "Erreur lors de la mise à jour du chauffeur");
  } catch (error) {
    console.error("Erreur updateChauffeur:", error);
    throw error;
  }
};

export const deleteChauffeur = async (id) => {
  try {
    const response = await adminFetch(`${API_BASE}/chauffeurs/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (data.success) {
      return data.message;
    }
    throw new Error(data.error || "Erreur lors de la suppression du chauffeur");
  } catch (error) {
    console.error("Erreur deleteChauffeur:", error);
    throw error;
  }
};
