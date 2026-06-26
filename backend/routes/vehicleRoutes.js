const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Seuils d'entretien par catégorie de véhicule (en kilomètres)
const maintenanceThresholds = {
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

// Calculer les estimations d'entretien pour un véhicule
const calculateMaintenanceEstimations = (vehicule) => {
  const category = vehicule.categorie || 'LIGHT';
  const thresholds = maintenanceThresholds[category];
  const currentKm = vehicule.kilometrage || 0;
  const weeklyKm = vehicule.weeklyKm || 500;
  
  if (weeklyKm === 0) return vehicule;

  // Trouver le dernier entretien de chaque type
  const historique = vehicule.historiqueEntretiens || [];
  const lastMaintenance = {
    vidange: historique.filter(h => h.type === 'vidange').sort((a, b) => new Date(b.dateEffectuee) - new Date(a.dateEffectuee))[0],
    categorie_b: historique.filter(h => h.type === 'bougies').sort((a, b) => new Date(b.dateEffectuee) - new Date(a.dateEffectuee))[0],
    categorie_c: historique.filter(h => h.type === 'freins').sort((a, b) => new Date(b.dateEffectuee) - new Date(a.dateEffectuee))[0]
  };

  console.log(`🔍 ${vehicule.immatriculation} - Historique:`, historique.map(h => ({ type: h.type, km: h.kilometrage })));
  console.log(`🔍 ${vehicule.immatriculation} - Last maintenance:`, {
    vidange: lastMaintenance.vidange?.kilometrage || 'aucun',
    categorie_b: lastMaintenance.categorie_b?.kilometrage || 'aucun',
    categorie_c: lastMaintenance.categorie_c?.kilometrage || 'aucun'
  });

  // Calculer les estimations pour chaque type
  ['vidange', 'categorie_b', 'categorie_c'].forEach(type => {
    const lastKm = lastMaintenance[type]?.kilometrage || 0;
    const nextThreshold = lastKm + thresholds[type];
    const kmRemaining = nextThreshold - currentKm;
    const weeksRemaining = Math.ceil(kmRemaining / weeklyKm);
    const daysRemaining = weeksRemaining * 7;

    vehicule[`${type}NextThreshold`] = nextThreshold;
    vehicule[`${type}KmRemaining`] = kmRemaining;
    vehicule[`${type}WeeksRemaining`] = weeksRemaining;
    vehicule[`${type}DaysRemaining`] = daysRemaining;

    console.log(`🔧 ${vehicule.immatriculation} - ${type}:`, {
      lastKm,
      nextThreshold,
      kmRemaining,
      daysRemaining
    });
  });

  return vehicule;
};

// Récupérer tous les véhicules
router.get('/vehicules', async (req, res) => {
  try {
    const vehicules = await prisma.vehicule.findMany({
      include: {
        chauffeur: true,
        historiqueEntretiens: {
          orderBy: {
            dateEffectuee: 'desc'
          }
        }
      }
    });

    // Calculer les estimations d'entretien pour chaque véhicule
    const vehiculesWithEstimations = vehicules.map(calculateMaintenanceEstimations);

    res.json({
      success: true,
      vehicules: vehiculesWithEstimations
    });
  } catch (error) {
    console.error('Erreur récupération véhicules:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des véhicules'
    });
  }
});

// Mettre à jour le kilométrage d'un véhicule
router.put('/vehicules/:immatriculation/mileage', async (req, res) => {
  try {
    const { immatriculation } = req.params;
    const { kilometrage } = req.body;

    const vehicule = await prisma.vehicule.update({
      where: { immatriculation },
      data: { kilometrage: parseInt(kilometrage) }
    });

    res.json({
      success: true,
      vehicule: vehicule
    });
  } catch (error) {
    console.error('Erreur mise à jour kilométrage:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du kilométrage'
    });
  }
});

// Valider un entretien
router.post('/entretiens/validate', async (req, res) => {
  try {
    const { vehiculeId, type, kilometrage, description } = req.body;

    // Créer l'entrée dans l'historique
    const entretien = await prisma.historiqueEntretien.create({
      data: {
        vehiculeId: parseInt(vehiculeId),
        type,
        kilometrage: parseInt(kilometrage),
        description: description || `Entretien ${type} effectué`
      }
    });

    // Mettre à jour le kilométrage du véhicule
    await prisma.vehicule.update({
      where: { id: parseInt(vehiculeId) },
      data: { kilometrage: parseInt(kilometrage) }
    });

    res.json({
      success: true,
      entretien: entretien
    });
  } catch (error) {
    console.error('Erreur validation entretien:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la validation de l\'entretien'
    });
  }
});

module.exports = router; 