const { PrismaClient } = require('@prisma/client');
const {
  notifyVehicleAssigned,
} = require('../services/notificationEmitter');
const prisma = new PrismaClient();

// Créer un véhicule
async function createVehicule(req, res) {
  try {
    console.log('BODY VEHICULE:', req.body);
    const { marque, modele, immatriculation, categorie, typeCarburant, kilometrage, statut, chauffeurId } = req.body;
    
    const vehicule = await prisma.vehicule.create({
      data: {
        marque,
        modele,
        immatriculation,
        categorie,
        typeCarburant: typeCarburant || 'ESSENCE',
        kilometrage: Number(kilometrage),
        statut: statut || "non attribué",
        chauffeurId: chauffeurId || null,
        dateAjout: new Date()
      }
    });

    res.status(201).json({ message: "Véhicule créé avec succès", vehicule });
  } catch (error) {
    console.error('Erreur création véhicule:', error);
    res.status(500).json({ error: error.message });
  }
}

// Récupérer tous les véhicules
async function getAllVehicules(req, res) {
  try {
    const vehicules = await prisma.vehicule.findMany({
      include: {
        chauffeur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            telephone: true,
            user: {
              select: {
                email: true
              }
            }
          }
        },
        historiqueEntretiens: {
          orderBy: { dateEffectuee: 'desc' }
          // Supprimé le 'take: 1' pour récupérer TOUS les entretiens
        }
      }
    });

    // Ajouter les estimations d'entretien calculées
    const vehiculesWithEstimations = vehicules.map(vehicule => {
      let finalCategory = vehicule.categorie || 'LIGHT';
      // S'assurer que la catégorie est valide
      if (!['HEAVY', 'LIGHT'].includes(finalCategory)) {
        finalCategory = 'LIGHT';
      }
      
      const thresholds = {
        HEAVY: { vidange: 8000, categorie_b: 16000, categorie_c: 24000 },
        LIGHT: { vidange: 5000, categorie_b: 10000, categorie_c: 15000 }
      };
      
      const currentKm = vehicule.kilometrage || 0;
      const weeklyKm = vehicule.weeklyKm || 500;
      
      console.log(`📊 Calculs dynamiques pour ${vehicule.immatriculation}:`, {
        currentKm,
        weeklyKm,
        finalCategory,
        historiqueCount: vehicule.historiqueEntretiens.length
      });
      
      // Calculer les estimations dynamiquement pour chaque type d'entretien
      const estimations = {};
      ['vidange', 'categorie_b', 'categorie_c'].forEach(type => {
        const threshold = thresholds[finalCategory][type];
        
        // Mapping des nouveaux noms vers les anciens noms pour la recherche dans l'historique
        const typeMapping = {
          'vidange': 'vidange',
          'categorie_b': 'bougies',
          'categorie_c': 'freins'
        };
        
        // Trouver le dernier entretien de CE TYPE SEULEMENT
        const oldType = typeMapping[type];
        const dernierEntretien = vehicule.historiqueEntretiens
          .filter(entretien => entretien.type.toLowerCase() === oldType.toLowerCase())
          .sort((a, b) => new Date(b.dateEffectuee) - new Date(a.dateEffectuee))[0];
        
        let baseKm;
        let prochainSeuil;
        
        if (dernierEntretien) {
          // Utiliser le kilométrage du dernier entretien de CE TYPE comme base
          baseKm = dernierEntretien.kilometrage;
          console.log(`  ${type}: Dernier entretien ${type} à ${baseKm} km`);
          
          // Calculer le prochain seuil basé sur le dernier entretien de CE TYPE
          const kmDepuisDernierEntretien = currentKm - baseKm;
          const seuilsPasses = Math.floor(kmDepuisDernierEntretien / threshold);
          prochainSeuil = baseKm + ((seuilsPasses + 1) * threshold);
          
          console.log(`    ${type}: Km depuis dernier entretien ${type}: ${kmDepuisDernierEntretien}, seuils passés: ${seuilsPasses}, prochain seuil: ${prochainSeuil}`);
        } else {
          // Aucun entretien précédent de CE TYPE, utiliser 0 comme base
          baseKm = 0;
          console.log(`  ${type}: Premier entretien ${type} (base: 0 km)`);
          
          // Le véhicule n'a pas encore atteint le premier seuil pour CE TYPE
          prochainSeuil = threshold;
        }
        
        // Vérifier si le véhicule a déjà dépassé le prochain seuil pour CE TYPE
        if (currentKm >= prochainSeuil) {
          // Le véhicule a dépassé le seuil pour CE TYPE, calculer le suivant
          const seuilsPasses = Math.floor(currentKm / threshold);
          prochainSeuil = (seuilsPasses + 1) * threshold;
          console.log(`    ${type}: Véhicule a dépassé le seuil ${type}, nouveau prochain seuil: ${prochainSeuil}`);
        }
        
        // Calculer les estimations dynamiques pour CE TYPE
        const kmRestants = prochainSeuil - currentKm;
        
        // Calculer les semaines restantes de manière cohérente avec le test
        let semainesRestantes = Math.ceil(kmRestants / weeklyKm);
        
        // S'assurer que les semaines restantes ne soient pas négatives
        if (kmRestants <= 0) {
          semainesRestantes = 0;
        }
        
        // Calculer les jours restants de manière cohérente avec le test
        const joursRestants = semainesRestantes * 7;
        
        console.log(`    ${type}: Calcul détaillé:`, {
          kmRestants,
          weeklyKm,
          semainesRestantes,
          joursRestants
        });
        
        estimations[`${type}NextThreshold`] = prochainSeuil;
        estimations[`${type}KmRemaining`] = kmRestants;
        estimations[`${type}WeeksRemaining`] = semainesRestantes;
        estimations[`${type}DaysRemaining`] = joursRestants;
        
        console.log(`  ${type}:`, {
          baseKm,
          prochainSeuil,
          kmRestants,
          semainesRestantes,
          joursRestants
        });
      });
      
      return {
        ...vehicule,
        ...estimations
      };
    });

    res.json({ vehicules: vehiculesWithEstimations });
  } catch (error) {
    console.error(' Erreur récupération véhicules:', error);
    res.status(500).json({ error: error.message });
  }
}

// Assigner un chauffeur à un véhicule
async function assignDriver(req, res) {
  try {
    const { id } = req.params;
    const { chauffeurId } = req.body;
    
    console.log('👤 Assignation chauffeur:', { vehiculeId: id, chauffeurId });
    
    // Récupérer l'ancien véhicule pour connaître l'ancien chauffeur
    const ancienVehicule = await prisma.vehicule.findUnique({
      where: { id: parseInt(id) },
      select: { chauffeurId: true }
    });
    
    // Vérifier si le chauffeur est déjà assigné à un autre véhicule
    if (chauffeurId) {
      const existingAssignment = await prisma.vehicule.findFirst({
        where: {
          chauffeurId: parseInt(chauffeurId),
          id: { not: parseInt(id) }
        }
      });
      
      if (existingAssignment) {
        return res.status(400).json({ 
          error: "Ce chauffeur est déjà assigné à un autre véhicule" 
        });
      }
    }
    
    // Mettre à jour le véhicule avec le nouveau chauffeur
    const vehicule = await prisma.vehicule.update({
      where: { id: parseInt(id) },
      data: {
        chauffeurId: chauffeurId ? parseInt(chauffeurId) : null,
        statut: chauffeurId ? "attribué" : "non attribué"
      },
      include: {
        chauffeur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            telephone: true,
            user: {
              select: {
                email: true
              }
            }
          }
        }
      }
    });

    // Mettre à jour le statut du nouveau chauffeur assigné
    if (chauffeurId) {
      await prisma.chauffeur.update({
        where: { id: parseInt(chauffeurId) },
        data: { statut: 'Attribué' }
      });
      console.log(' Statut nouveau chauffeur mis à jour: Attribué');
    }

    // Mettre à jour le statut de l'ancien chauffeur si il y en avait un
    if (ancienVehicule && ancienVehicule.chauffeurId && ancienVehicule.chauffeurId !== parseInt(chauffeurId)) {
      // Vérifier si l'ancien chauffeur n'est plus assigné à aucun véhicule
      const autresVehicules = await prisma.vehicule.findFirst({
        where: {
          chauffeurId: ancienVehicule.chauffeurId,
          id: { not: parseInt(id) }
        }
      });
      
      if (!autresVehicules) {
        await prisma.chauffeur.update({
          where: { id: ancienVehicule.chauffeurId },
          data: { statut: 'Non attribué' }
        });
        console.log(' Statut ancien chauffeur mis à jour: Non attribué');
      }
    }

    console.log(' Chauffeur assigné:', vehicule);
    if (chauffeurId) {
      await notifyVehicleAssigned(vehicule, parseInt(chauffeurId));
    }
    res.json({ 
      message: chauffeurId ? "Chauffeur assigné avec succès" : "Chauffeur retiré avec succès", 
      vehicule 
    });
  } catch (error) {
    console.error(' Erreur assignation chauffeur:', error);
    res.status(500).json({ error: error.message });
  }
}

// Mettre à jour un véhicule
async function updateVehicule(req, res) {
  try {
    const { id } = req.params;
    const { marque, modele, immatriculation, categorie, typeCarburant, kilometrage, statut, chauffeurId } = req.body;
    
    console.log(' Mise à jour véhicule:', { id, marque, modele, immatriculation, categorie, typeCarburant, kilometrage });
    
    const vehicule = await prisma.vehicule.update({
      where: { id: parseInt(id) },
      data: {
        marque,
        modele,
        immatriculation,
        categorie,
        ...(typeCarburant ? { typeCarburant } : {}),
        kilometrage: Number(kilometrage),
        statut,
        chauffeurId: chauffeurId || null
      },
      include: {
        chauffeur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            telephone: true,
            user: {
              select: {
                email: true
              }
            }
          }
        }
      }
    });

    console.log(' Véhicule mis à jour:', vehicule);
    res.json({ message: "Véhicule mis à jour avec succès", vehicule });
  } catch (error) {
    console.error(' Erreur mise à jour véhicule:', error);
    res.status(500).json({ error: error.message });
  }
}

// Supprimer un véhicule
async function deleteVehicule(req, res) {
  try {
    const { id } = req.params;
    
    console.log(' Suppression véhicule:', id);
    
    await prisma.vehicule.delete({
      where: { id: parseInt(id) }
    });

    console.log(' Véhicule supprimé avec succès');
    res.json({ message: "Véhicule supprimé avec succès" });
  } catch (error) {
    console.error(' Erreur suppression véhicule:', error);
    res.status(500).json({ error: error.message });
  }
}

// Mettre à jour le kilométrage d'un véhicule (admin — mises à jour multiples autorisées)
async function updateMileage(req, res) {
  try {
    const { immatriculation } = req.params;
    const { newMileage } = req.body;

    const vehicule = await prisma.vehicule.findUnique({
      where: { immatriculation },
    });

    if (!vehicule) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }

    const mileageService = require('../services/mileageService');
    const result = await mileageService.updateMileageCore({
      vehiculeId: vehicule.id,
      newMileage,
      source: 'admin',
    });

    res.json({
      message: 'Kilométrage mis à jour avec succès',
      vehicule: result.vehicule,
      weeklyKm: result.weeklyKm,
    });
  } catch (error) {
    const status = error.status || 500;
    console.error('Erreur mise à jour kilométrage:', error);
    res.status(status).json({ error: error.message });
  }
}

module.exports = {
  createVehicule,
  getAllVehicules,
  updateVehicule,
  deleteVehicule,
  updateMileage,
  assignDriver
}; 