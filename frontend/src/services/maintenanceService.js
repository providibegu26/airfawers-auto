import { apiPath } from "@/config/api";

// Seuils d'entretien par catégorie de véhicule (en kilomètres)
export const maintenanceThresholds = {
  HEAVY: {
    vidange: 8000,
    categorie_b: 16000,
    categorie_c: 24000
  },
  LIGHT: {
    vidange: 5000,
    categorie_b: 10000,
    categorie_c: 15000
  }
};

// Récupérer les véhicules depuis la base de données
export const fetchVehicles = async () => {
  try {
    console.log('🔄 Récupération des véhicules depuis le serveur...');
    const response = await fetch(apiPath("/admin/vehicules"));
    const data = await response.json();
    
    console.log('📊 Données reçues du serveur:', data.vehicules?.length || 0, 'véhicules');
    
    // Ajouter les propriétés nécessaires pour les entretiens
    const vehiclesWithMaintenance = data.vehicules.map(vehicle => {
      const vehicleWithData = {
        ...vehicle,
        currentMileage: vehicle.kilometrage || 0,
        weeklyKm: vehicle.weeklyKm || 500,
        lastMaintenanceUpdate: null,
        lastMileageUpdate: null,
        maintenanceHistory: []
      };
      
      return vehicleWithData;
    });
    
    return vehiclesWithMaintenance;
  } catch (error) {
    console.error(' Erreur récupération véhicules:', error);
    throw error;
  }
};

// Calculer les entretiens pour un véhicule
export const calculateMaintenanceForVehicle = (vehicle, fleetAverage) => {
  const category = vehicle.categorie || 'LIGHT';
  const thresholds = maintenanceThresholds[category];
  const currentKm = vehicle.currentMileage || vehicle.kilometrage || 0;
  const weeklyKm = vehicle.weeklyKm || fleetAverage;
  
  if (weeklyKm === 0) return null;

  // Utiliser les estimations dynamiques calculées côté serveur
  const maintenance = {
    vidange: {
      threshold: thresholds.vidange,
      nextKm: vehicle.vidangeNextThreshold,
      kmRemaining: vehicle.vidangeKmRemaining,
      weeksRemaining: vehicle.vidangeWeeksRemaining,
      daysRemaining: vehicle.vidangeDaysRemaining
    },
    categorie_b: {
      threshold: thresholds.categorie_b,
      nextKm: vehicle.categorie_bNextThreshold,
      kmRemaining: vehicle.categorie_bKmRemaining,
      weeksRemaining: vehicle.categorie_bWeeksRemaining,
      daysRemaining: vehicle.categorie_bDaysRemaining
    },
    categorie_c: {
      threshold: thresholds.categorie_c,
      nextKm: vehicle.categorie_cNextThreshold,
      kmRemaining: vehicle.categorie_cKmRemaining,
      weeksRemaining: vehicle.categorie_cWeeksRemaining,
      daysRemaining: vehicle.categorie_cDaysRemaining
    }
  };

  return maintenance;
};

// Calculer les statistiques d'entretien pour un type spécifique
export const calculateMaintenanceStats = (vehicles, type) => {
  const maintenanceList = [];
  
  vehicles.forEach(vehicle => {
    const nextThreshold = vehicle[`${type}NextThreshold`];
    const daysRemaining = vehicle[`${type}DaysRemaining`];
    
    if (nextThreshold && daysRemaining !== undefined) {
      maintenanceList.push({
        vehicle: vehicle,
        maintenance: {
          nextThreshold: nextThreshold,
          daysRemaining: daysRemaining,
          kmRemaining: vehicle[`${type}KmRemaining`],
          weeksRemaining: vehicle[`${type}WeeksRemaining`]
        },
        type: type
      });
    }
  });
  
  return maintenanceList.sort((a, b) => a.maintenance.daysRemaining - b.maintenance.daysRemaining);
};

// Compter les entretiens de chaque catégorie
export const countCategoryMaintenance = (vehicles, type) => {
  let count = 0;
  
  vehicles.forEach(vehicle => {
    const nextThreshold = vehicle[`${type}NextThreshold`];
    const daysRemaining = vehicle[`${type}DaysRemaining`];
    
    if (nextThreshold && daysRemaining !== undefined) {
      if (daysRemaining > 7) {
        count++;
      }
    }
  });
  
  return count;
};

// Calculer les entretiens urgents (≤ 7 jours)
export const getUrgentMaintenance = (vehicles) => {
  const allMaintenance = [];
  
  vehicles.forEach(vehicle => {
    ['vidange', 'categorie_b', 'categorie_c'].forEach(type => {
      const nextThreshold = vehicle[`${type}NextThreshold`];
      const daysRemaining = vehicle[`${type}DaysRemaining`];
      
      if (nextThreshold && daysRemaining !== undefined) {
        if (daysRemaining <= 7) {
          allMaintenance.push({
            vehicle: vehicle,
            maintenance: {
              nextThreshold: nextThreshold,
              daysRemaining: daysRemaining,
              kmRemaining: vehicle[`${type}KmRemaining`],
              weeksRemaining: vehicle[`${type}WeeksRemaining`]
            },
            type: type
          });
        }
      }
    });
  });
  
  return allMaintenance.sort((a, b) => a.maintenance.daysRemaining - b.maintenance.daysRemaining);
};

// Calculer les entretiens pour les pages spécifiques
export const getNonUrgentMaintenance = (vehicles, type) => {
  const maintenanceList = [];
  
  vehicles.forEach(vehicle => {
    const nextThreshold = vehicle[`${type}NextThreshold`];
    const daysRemaining = vehicle[`${type}DaysRemaining`];
    
    if (nextThreshold && daysRemaining !== undefined) {
      if (daysRemaining > 7) {
        maintenanceList.push({
          vehicle: vehicle,
          maintenance: {
            nextThreshold: nextThreshold,
            daysRemaining: daysRemaining,
            kmRemaining: vehicle[`${type}KmRemaining`],
            weeksRemaining: vehicle[`${type}WeeksRemaining`]
          },
          type: type
        });
      }
    }
  });
  
  return maintenanceList.sort((a, b) => a.maintenance.daysRemaining - b.maintenance.daysRemaining);
};

// Mettre à jour le kilométrage d'un véhicule
export const updateVehicleMileage = async (vehiclePlate, newMileage) => {
  try {
    const response = await fetch(apiPath(`/admin/vehicules/${vehiclePlate}/mileage`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newMileage })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du kilométrage');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur mise à jour kilométrage:', error);
    throw error;
  }
};

// Valider un entretien
export const validateMaintenance = async (vehicle, maintenanceType) => {
  try {
    const currentMileage = vehicle.currentMileage || vehicle.kilometrage || 0;
    
    const response = await fetch(apiPath("/admin/entretiens/validate"), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehiculeId: vehicle.id,
        type: maintenanceType,
        kilometrage: currentMileage,
        description: `Entretien ${maintenanceType} effectué`
      })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la validation de l\'entretien');
    }

    const data = await response.json();
    
    const updatedVehicle = {
      ...vehicle,
      currentMileage: currentMileage,
      lastMaintenanceUpdate: new Date().toISOString()
    };
    
    return updatedVehicle;
    
  } catch (error) {
    console.error('Erreur validation entretien:', error);
    throw error;
  }
};

// Formater les données pour l'affichage dans les tableaux
export const formatMaintenanceData = (maintenanceList) => {
  const getTypeLabel = (type) => {
    const typeLabels = {
      'vidange': 'Catégorie A',
      'categorie_b': 'Catégorie B',
      'categorie_c': 'Catégorie C'
    };
    return typeLabels[type] || type;
  };

  return maintenanceList.map(item => {
    const currentDate = new Date();
    const maintenanceDate = new Date(currentDate);
    maintenanceDate.setDate(currentDate.getDate() + item.maintenance.daysRemaining);
    
    return {
      id: item.vehicle.id,
      immatriculation: item.vehicle.immatriculation,
      marque: item.vehicle.marque,
      modele: item.vehicle.modele,
      chauffeur: item.vehicle.chauffeur 
        ? `${item.vehicle.chauffeur.nom} ${item.vehicle.chauffeur.prenom}`
        : 'Non attribué',
      kilometrage: item.vehicle.currentMileage,
      type: getTypeLabel(item.type),
      seuil: item.maintenance.threshold,
      prochainKm: item.maintenance.nextKm,
      kmRestants: item.maintenance.kmRemaining,
      semainesRestantes: item.maintenance.weeksRemaining,
      joursRestants: item.maintenance.daysRemaining,
      dateEntretien: maintenanceDate.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      statut: item.maintenance.daysRemaining <= 7 ? 'Urgent' : 
              item.maintenance.daysRemaining <= 14 ? 'À venir' : 'Normal'
    };
  });
};

// Générer la liste des entretiens prévus
export const getUpcomingMaintenances = (vehicles, daysWindow = 60) => {
  const upcomingMaintenances = [];
  
  vehicles.forEach(vehicle => {
    ['vidange', 'categorie_b', 'categorie_c'].forEach(type => {
      const daysRemaining = vehicle[`${type}DaysRemaining`];
      
      if (daysRemaining !== undefined && daysRemaining <= daysWindow) {
        const currentDate = new Date();
        const maintenanceDate = new Date(currentDate);
        maintenanceDate.setDate(currentDate.getDate() + daysRemaining);
        
        upcomingMaintenances.push({
          vehicle: vehicle,
          type: type,
          daysRemaining: daysRemaining,
          nextThreshold: vehicle[`${type}NextThreshold`],
          maintenanceDate: maintenanceDate,
          dateKey: maintenanceDate.toISOString().slice(0, 10)
        });
      }
    });
  });
  
  return upcomingMaintenances.sort((a, b) => a.daysRemaining - b.daysRemaining);
};

// Fonction pour générer les données du calendrier
export const generateCalendarData = (vehicles, targetMonth = null, targetYear = null, daysWindow = 60) => {
  const upcomingMaintenances = getUpcomingMaintenances(vehicles, daysWindow);
  const calendarData = {};
  
  upcomingMaintenances.forEach(maintenance => {
    const { dateKey, vehicle, type, daysRemaining, maintenanceDate } = maintenance;
    
    // Filtrer par mois et année si spécifiés
    if (targetMonth !== null && targetYear !== null) {
      const maintenanceMonth = maintenanceDate.getMonth();
      const maintenanceYear = maintenanceDate.getFullYear();
      
      if (maintenanceMonth !== targetMonth || maintenanceYear !== targetYear) {
        return;
      }
    }
    
    if (!calendarData[dateKey]) {
      calendarData[dateKey] = {
        date: dateKey,
        maintenanceDate: maintenanceDate,
        entretiens: []
      };
    }
    
    // Déterminer le statut de couleur
    let colorStatus = 'green';
    if (daysRemaining <= 7) colorStatus = 'red';
    else if (daysRemaining <= 14) colorStatus = 'orange';
    
    calendarData[dateKey].entretiens.push({
      vehicle: vehicle,
      type: type,
      daysRemaining: daysRemaining,
      colorStatus: colorStatus,
      typeLabel: type === 'vidange' ? 'Catégorie A' : 
                 type === 'categorie_b' ? 'Catégorie B' : 'Catégorie C',
      // Ajouter les informations du véhicule
      immatriculation: vehicle.immatriculation,
      marque: vehicle.marque,
      modele: vehicle.modele,
      // Ajouter les informations du chauffeur
      chauffeur: vehicle.chauffeur 
        ? `${vehicle.chauffeur.nom} ${vehicle.chauffeur.prenom}`
        : 'Non attribué',
      telephone: vehicle.chauffeur?.telephone || null
    });
  });
  
  return Object.values(calendarData).sort((a, b) => new Date(a.date) - new Date(b.date));
}; 