const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedData() {
  try {
    console.log('🌱 Ajout des données de test...\n');

    // Créer des véhicules de test
    const vehicules = [
      {
        immatriculation: 'ABC123',
        marque: 'Toyota',
        modele: 'Corolla',
        annee: 2020,
        categorie: 'LIGHT',
        kilometrage: 45000,
        weeklyKm: 500,
        statut: 'disponible'
      },
      {
        immatriculation: 'XYZ789',
        marque: 'Honda',
        modele: 'Civic',
        annee: 2021,
        categorie: 'LIGHT',
        kilometrage: 32000,
        weeklyKm: 450,
        statut: 'disponible'
      },
      {
        immatriculation: 'DEF456',
        marque: 'Ford',
        modele: 'Transit',
        annee: 2019,
        categorie: 'HEAVY',
        kilometrage: 78000,
        weeklyKm: 600,
        statut: 'disponible'
      }
    ];

    for (const vehicule of vehicules) {
      const existing = await prisma.vehicule.findUnique({
        where: { immatriculation: vehicule.immatriculation }
      });

      if (!existing) {
        await prisma.vehicule.create({
          data: vehicule
        });
        console.log(`✅ Véhicule ${vehicule.immatriculation} créé`);
      } else {
        console.log(`⚠️ Véhicule ${vehicule.immatriculation} existe déjà`);
      }
    }

    // Ajouter quelques entretiens de test
    const entretiens = [
      {
        vehiculeId: 1,
        type: 'vidange',
        kilometrage: 40000,
        description: 'Vidange d\'huile effectuée'
      },
      {
        vehiculeId: 1,
        type: 'bougies',
        kilometrage: 35000,
        description: 'Changement des bougies'
      },
      {
        vehiculeId: 2,
        type: 'freins',
        kilometrage: 30000,
        description: 'Révision des freins'
      }
    ];

    for (const entretien of entretiens) {
      await prisma.historiqueEntretien.create({
        data: entretien
      });
      console.log(`✅ Entretien ${entretien.type} ajouté pour véhicule ${entretien.vehiculeId}`);
    }

    console.log('\n✅ Données de test ajoutées avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData(); 