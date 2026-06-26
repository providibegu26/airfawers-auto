const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createUrgentMaintenance() {
  console.log('🔧 Création d\'entretiens urgents de test');
  console.log('========================================');

  try {
    // 1. Récupérer tous les véhicules
    const vehicles = await prisma.vehicule.findMany();
    console.log(`📊 ${vehicles.length} véhicules trouvés`);

    if (vehicles.length === 0) {
      console.log('❌ Aucun véhicule trouvé');
      return;
    }

    // 2. Prendre le premier véhicule et créer des entretiens urgents
    const vehicle = vehicles[0];
    console.log(`🚗 Utilisation du véhicule: ${vehicle.immatriculation}`);

    // 3. Créer des entretiens avec des dates anciennes pour créer des urgences
    const urgentMaintenanceTypes = [
      { type: 'vidange', daysAgo: 8, kmAgo: 4000 },
      { type: 'categorie_b', daysAgo: 5, kmAgo: 8000 },
      { type: 'categorie_c', daysAgo: 3, kmAgo: 12000 }
    ];

    for (const maintenance of urgentMaintenanceTypes) {
      const maintenanceDate = new Date();
      maintenanceDate.setDate(maintenanceDate.getDate() - maintenance.daysAgo);
      
      const maintenanceKm = vehicle.kilometrage - maintenance.kmAgo;

      console.log(`🔧 Création entretien ${maintenance.type}...`);
      
      await prisma.historiqueEntretien.create({
        data: {
          vehiculeId: vehicle.id,
          type: maintenance.type,
          kilometrage: maintenanceKm,
          description: `Test entretien urgent ${maintenance.type}`,
          dateEffectuee: maintenanceDate
        }
      });

      console.log(`✅ Entretien ${maintenance.type} créé`);
    }

    console.log('\n🎉 Entretiens urgents créés avec succès !');
    console.log('📝 Maintenant, rechargez la page des entretiens urgents pour voir les résultats.');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUrgentMaintenance();

