import { apiPath } from "@/config/api";

const API_BASE_URL = apiPath("/admin");

// Récupérer tous les chauffeurs
export const fetchChauffeurs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/chauffeurs`);
    const data = await response.json();
    
    if (data.success) {
      return data.chauffeurs;
    } else {
      throw new Error(data.error || 'Erreur lors de la récupération des chauffeurs');
    }
  } catch (error) {
    console.error('Erreur fetchChauffeurs:', error);
    throw error;
  }
};

// Créer un nouveau chauffeur
export const createChauffeur = async (chauffeurData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chauffeurs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chauffeurData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.chauffeur;
    } else {
      throw new Error(data.error || 'Erreur lors de la création du chauffeur');
    }
  } catch (error) {
    console.error('Erreur createChauffeur:', error);
    throw error;
  }
};

// Mettre à jour un chauffeur
export const updateChauffeur = async (id, chauffeurData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chauffeurs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chauffeurData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.chauffeur;
    } else {
      throw new Error(data.error || 'Erreur lors de la mise à jour du chauffeur');
    }
  } catch (error) {
    console.error('Erreur updateChauffeur:', error);
    throw error;
  }
};

// Supprimer un chauffeur
export const deleteChauffeur = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chauffeurs/${id}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.message;
    } else {
      throw new Error(data.error || 'Erreur lors de la suppression du chauffeur');
    }
  } catch (error) {
    console.error('Erreur deleteChauffeur:', error);
    throw error;
  }
}; 