const { PrismaClient } = require('@prisma/client');
const { notifyMaintenanceRecorded } = require('../services/notificationEmitter');
const prisma = new PrismaClient();

// Valider un entretien et le sauvegarder en base
async function validateMaintenance(req, res) {
  try {
    const { vehiculeId, type, kilometrage, description } = req.body;

    console.log('🔧 Validation entretien:', { vehiculeId, type, kilometrage });

    // Vérifier que le véhicule existe
    const vehicule = await prisma.vehicule.findUnique({
      where: { id: parseInt(vehiculeId) },
      include: { chauffeur: true },
    });

    if (!vehicule) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }

    // Mapping des nouveaux noms vers les anciens noms pour la sauvegarde
    const typeMapping = {
      'vidange': 'vidange',
      'categorie_b': 'bougies',
      'categorie_c': 'freins'
    };

    const oldType = typeMapping[type] || type;
    console.log(` Mapping: ${type} → ${oldType}`);

    // Sauvegarder l'entretien en base avec l'ancien nom
    const entretien = await prisma.historiqueEntretien.create({
      data: {
        vehiculeId: parseInt(vehiculeId),
        type: oldType,
        kilometrage: parseInt(kilometrage),
        description: description || `Entretien ${type} effectué`
      }
    });

    console.log(' Entretien sauvegardé:', entretien);

    await notifyMaintenanceRecorded(vehicule, type);

    // Recalculer les estimations pour ce véhicule
    console.log(' Recalcul des estimations après validation...');
    
    // Récupérer le véhicule avec l'historique complet pour recalculer les estimations
    const updatedVehicule = await prisma.vehicule.findUnique({
      where: { id: parseInt(vehiculeId) },
      include: {
        historiqueEntretiens: {
          orderBy: { dateEffectuee: 'desc' }
        }
      }
    });

    // Calculer les nouvelles estimations manuellement
    const thresholds = {
      HEAVY: { vidange: 8000, categorie_b: 16000, categorie_c: 24000 },
      LIGHT: { vidange: 5000, categorie_b: 10000, categorie_c: 15000 }
    };
    
    // Normaliser la catégorie du véhicule
    let finalCategory = updatedVehicule.categorie || 'LIGHT';
    
    // Mapping des catégories vers LIGHT/HEAVY
    if (finalCategory === 'Berline' || finalCategory === 'SUV' || finalCategory === 'Citadine') {
      finalCategory = 'LIGHT';
    } else if (finalCategory === 'Camion' || finalCategory === 'Fourgon') {
      finalCategory = 'HEAVY';
    } else if (finalCategory !== 'LIGHT' && finalCategory !== 'HEAVY') {
      finalCategory = 'LIGHT'; // Par défaut
    }
    
    console.log(` Catégorie normalisée: ${updatedVehicule.categorie} → ${finalCategory}`);
    const currentKm = updatedVehicule.kilometrage || 0;
    const weeklyKm = updatedVehicule.weeklyKm || 500;
    
    // Trouver le dernier entretien de ce type (qui vient d'être créé)
    const dernierEntretien = updatedVehicule.historiqueEntretiens
      .filter(entretien => entretien.type.toLowerCase() === oldType.toLowerCase())
      .sort((a, b) => new Date(b.dateEffectuee) - new Date(a.dateEffectuee))[0];
    
    if (dernierEntretien) {
      console.log(` Nouvel entretien ${type} enregistré à ${dernierEntretien.kilometrage} km`);
      console.log(` Prochaine estimation basée sur ce nouvel entretien`);
    }

    // Calculer les nouvelles estimations pour chaque type d'entretien
    // Réutiliser le typeMapping déjà déclaré plus haut

    // Calculer les estimations pour chaque type
    const estimations = {};
    
    Object.keys(typeMapping).forEach(typeKey => {
      const dbType = typeMapping[typeKey];
      const threshold = thresholds[finalCategory][typeKey];
      
      // Trouver le dernier entretien de ce type
      const dernierEntretienType = updatedVehicule.historiqueEntretiens
        .filter(entretien => entretien.type.toLowerCase() === dbType.toLowerCase())
        .sort((a, b) => new Date(b.dateEffectuee) - new Date(a.dateEffectuee))[0];
      
      if (dernierEntretienType) {
        const kmDepuisDernierEntretien = currentKm - dernierEntretienType.kilometrage;
        const kmRestants = threshold - kmDepuisDernierEntretien;
        const joursRestants = Math.ceil(kmRestants / weeklyKm);
        
        estimations[`${typeKey}DaysRemaining`] = joursRestants;
        estimations[`${typeKey}KmRemaining`] = kmRestants;
      } else {
        // Aucun entretien précédent, calculer depuis 0
        const kmRestants = threshold - currentKm;
        const joursRestants = Math.ceil(kmRestants / weeklyKm);
        
        estimations[`${typeKey}DaysRemaining`] = joursRestants;
        estimations[`${typeKey}KmRemaining`] = kmRestants;
      }
    });

    // Ajouter les estimations au véhicule
    const vehiculeAvecEstimations = {
      ...updatedVehicule,
      ...estimations
    };

    console.log(' Nouvelles estimations calculées:', estimations);

    // Retourner l'entretien créé ET le véhicule mis à jour avec les estimations
    res.status(201).json({
      message: `Entretien ${type} validé avec succès`,
      entretien,
      vehicule: vehiculeAvecEstimations
    });

  } catch (error) {
    console.error(' Erreur validation entretien:', error);
    res.status(500).json({ error: error.message });
  }
}

// Récupérer l'historique des entretiens d'un véhicule
async function getMaintenanceHistory(req, res) {
  try {
    const { vehiculeId } = req.params;

    const historique = await prisma.historiqueEntretien.findMany({
      where: { vehiculeId: parseInt(vehiculeId) },
      include: {
        vehicule: {
          select: {
            immatriculation: true,
            marque: true,
            modele: true
          }
        }
      },
      orderBy: { dateEffectuee: 'desc' }
    });

    res.json({ historique });

  } catch (error) {
    console.error(' Erreur récupération historique:', error);
    res.status(500).json({ error: error.message });
  }
}

// Récupérer tous les entretiens
async function getAllMaintenanceHistory(req, res) {
  try {
    const historique = await prisma.historiqueEntretien.findMany({
      include: {
        vehicule: {
          select: {
            immatriculation: true,
            marque: true,
            modele: true
          }
        }
      },
      orderBy: { dateEffectuee: 'desc' }
    });

    res.json({ historique });

  } catch (error) {
    console.error(' Erreur récupération historique:', error);
    res.status(500).json({ error: error.message });
  }
}

// Supprimer un entretien spécifique
async function deleteMaintenance(req, res) {
  try {
    const { id } = req.params;
    
    console.log(' Suppression entretien:', { id });

    // Vérifier que l'entretien existe
    const entretien = await prisma.historiqueEntretien.findUnique({
      where: { id: parseInt(id) }
    });

    if (!entretien) {
      return res.status(404).json({ error: 'Entretien non trouvé' });
    }

    // Supprimer l'entretien
    await prisma.historiqueEntretien.delete({
      where: { id: parseInt(id) }
    });

    console.log(' Entretien supprimé:', entretien);
    res.json({ 
      message: 'Entretien supprimé avec succès',
      deletedEntretien: entretien
    });

  } catch (error) {
    console.error(' Erreur suppression entretien:', error);
    res.status(500).json({ error: error.message });
  }
}

// Vider tout l'historique des entretiens
async function clearAllMaintenance(req, res) {
  try {
    console.log(' Vidage de tout l\'historique des entretiens');

    // Supprimer tous les entretiens
    const result = await prisma.historiqueEntretien.deleteMany({});

    console.log(' Historique vidé:', result.count, 'entretiens supprimés');
    res.json({ 
      message: `Historique vidé avec succès (${result.count} entretiens supprimés)`,
      deletedCount: result.count
    });

  } catch (error) {
    console.error(' Erreur vidage historique:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  validateMaintenance,
  getMaintenanceHistory,
  getAllMaintenanceHistory,
  deleteMaintenance,
  clearAllMaintenance
}; 