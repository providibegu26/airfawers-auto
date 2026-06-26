const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkExistingVehicles() {
  try {
    console.log('🔍 Vérification des véhicules existants...');
    
    // Récupérer tous les véhicules avec leur historique
    const vehicles = await prisma.vehicule.findMany({
      include: {
        chauffeur: {
          select: {
            nom: true,
            prenom: true
          }
        },
        historiqueEntretiens: {
          orderBy: { dateEffectuee: 'desc' }
        }
      }
    });
    
    console.log(`📊 ${vehicles.length} véhicules trouvés`);
    
    const thresholds = {
      HEAVY: { vidange: 8000, bougies: 80000, freins: 20000 },
      LIGHT: { vidange: 5000, bougies: 40000, freins: 50000 }
    };
    
    vehicles.forEach((vehicle, index) => {
      console.log(`\n🚗 Véhicule ${index + 1}: ${vehicle.immatriculation}`);
      console.log('Données:', {
        categorie: vehicle.categorie || 'LIGHT',
        kilometrage: vehicle.kilometrage,
        weeklyKm: vehicle.weeklyKm,
        chauffeur: vehicle.chauffeur ? `${vehicle.chauffeur.prenom} ${vehicle.chauffeur.nom}` : 'Non assigné',
        historiqueCount: vehicle.historiqueEntretiens.length
      });
      
      const category = vehicle.categorie || 'LIGHT';
      const currentKm = vehicle.kilometrage || 0;
      const weeklyKm = vehicle.weeklyKm || 500;
      
      // Calculer pour chaque type d'entretien
      ['vidange', 'bougies', 'freins'].forEach(type => {
        const threshold = thresholds[category][type];
        
        // Trouver le dernier entretien de ce type
        const dernierEntretien = vehicle.historiqueEntretiens.find(
          entretien => entretien.type === type
        );
        
        let baseKm;
        if (dernierEntretien) {
          baseKm = dernierEntretien.kilometrage;
        } else {
          baseKm = currentKm;
        }
        
        // Calculer le prochain seuil
        let prochainSeuil;
        if (baseKm >= threshold) {
          const seuilsPasses = Math.floor(baseKm / threshold);
          prochainSeuil = (seuilsPasses + 1) * threshold;
        } else {
          prochainSeuil = threshold;
        }
        
        // Calculer les estimations
        const kmRestants = prochainSeuil - currentKm;
        const semainesRestantes = Math.ceil(kmRestants / weeklyKm);
        const joursRestants = semainesRestantes * 7;
        
        console.log(`  ${type}:`, {
          dernierEntretien: dernierEntretien ? `${dernierEntretien.kilometrage} km` : 'Aucun',
          seuil: threshold,
          prochainSeuil,
          kmRestants,
          joursRestants,
          isUrgent: joursRestants <= 7,
          isEnRetard: joursRestants < 0
        });
        
        if (joursRestants <= 7) {
          console.log(`    🚨 URGENT: ${type} apparaîtra dans les entretiens urgents`);
        }
      });
    });
    
    console.log('\n🎉 Vérification terminée !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExistingVehicles(); 