// Test de synchronisation entre toutes les pages
import { getUrgentMaintenance, getNonUrgentMaintenance } from './services/maintenanceService.js';

// Données de test avec différents scénarios
const testVehicles = [
  {
    id: 1,
    immatriculation: 'ABC123',
    categorie: 'HEAVY',
    kilometrage: 1000,
    weeklyKm: 500,
    historiqueEntretiens: [],
    // Estimations calculées côté serveur
    vidangeNextThreshold: 8000,
    vidangeDaysRemaining: 98,
    vidangeKmRemaining: 7000,
    vidangeWeeksRemaining: 14,
    bougiesNextThreshold: 80000,
    bougiesDaysRemaining: 1092,
    bougiesKmRemaining: 79000,
    bougiesWeeksRemaining: 156,
    freinsNextThreshold: 20000,
    freinsDaysRemaining: 273,
    freinsKmRemaining: 19000,
    freinsWeeksRemaining: 39
  },
  {
    id: 2,
    immatriculation: 'XYZ789',
    categorie: 'LIGHT',
    kilometrage: 6000,
    weeklyKm: 500,
    historiqueEntretiens: [],
    // Estimations calculées côté serveur
    vidangeNextThreshold: 10000,
    vidangeDaysRemaining: 56,
    vidangeKmRemaining: 4000,
    vidangeWeeksRemaining: 8,
    bougiesNextThreshold: 40000,
    bougiesDaysRemaining: 476,
    bougiesKmRemaining: 34000,
    bougiesWeeksRemaining: 68,
    freinsNextThreshold: 50000,
    freinsDaysRemaining: 595,
    freinsKmRemaining: 44000,
    freinsWeeksRemaining: 85
  },
  {
    id: 3,
    immatriculation: 'DEF456',
    categorie: 'HEAVY',
    kilometrage: 8500,
    weeklyKm: 500,
    historiqueEntretiens: [
      {
        type: 'vidange',
        kilometrage: 8000,
        dateEffectuee: '2024-01-15'
      }
    ],
    // Estimations calculées côté serveur
    vidangeNextThreshold: 16000,
    vidangeDaysRemaining: 105,
    vidangeKmRemaining: 7500,
    vidangeWeeksRemaining: 15,
    bougiesNextThreshold: 80000,
    bougiesDaysRemaining: 1092,
    bougiesKmRemaining: 71500,
    bougiesWeeksRemaining: 156,
    freinsNextThreshold: 20000,
    freinsDaysRemaining: 273,
    freinsKmRemaining: 11500,
    freinsWeeksRemaining: 39
  },
  {
    id: 4,
    immatriculation: 'GHI789',
    categorie: 'LIGHT',
    kilometrage: 4500,
    weeklyKm: 500,
    historiqueEntretiens: [],
    // Estimations calculées côté serveur
    vidangeNextThreshold: 5000,
    vidangeDaysRemaining: 7,
    vidangeKmRemaining: 500,
    vidangeWeeksRemaining: 1,
    bougiesNextThreshold: 40000,
    bougiesDaysRemaining: 476,
    bougiesKmRemaining: 35500,
    bougiesWeeksRemaining: 68,
    freinsNextThreshold: 50000,
    freinsDaysRemaining: 595,
    freinsKmRemaining: 45500,
    freinsWeeksRemaining: 85
  }
];

function testSynchronisation() {
  console.log('🧪 Test de synchronisation entre toutes les pages...');
  
  // Test 1: Entretiens urgents
  console.log('\n🚨 1. Test des entretiens urgents');
  const urgentMaintenance = getUrgentMaintenance(testVehicles);
  console.log('✅ Entretiens urgents trouvés:', urgentMaintenance.length);
  urgentMaintenance.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.vehicle.immatriculation} - ${item.type}: ${item.maintenance.daysRemaining} jours`);
  });
  
  // Test 2: Entretiens vidange non-urgents
  console.log('\n📋 2. Test des entretiens vidange non-urgents');
  const vidangeMaintenance = getNonUrgentMaintenance(testVehicles, 'vidange');
  console.log('✅ Entretiens vidange non-urgents trouvés:', vidangeMaintenance.length);
  vidangeMaintenance.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.vehicle.immatriculation}: ${item.maintenance.daysRemaining} jours`);
  });
  
  // Test 3: Entretiens bougies non-urgents
  console.log('\n📋 3. Test des entretiens bougies non-urgents');
  const bougiesMaintenance = getNonUrgentMaintenance(testVehicles, 'bougies');
  console.log('✅ Entretiens bougies non-urgents trouvés:', bougiesMaintenance.length);
  bougiesMaintenance.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.vehicle.immatriculation}: ${item.maintenance.daysRemaining} jours`);
  });
  
  // Test 4: Entretiens freins non-urgents
  console.log('\n📋 4. Test des entretiens freins non-urgents');
  const freinsMaintenance = getNonUrgentMaintenance(testVehicles, 'freins');
  console.log('✅ Entretiens freins non-urgents trouvés:', freinsMaintenance.length);
  freinsMaintenance.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.vehicle.immatriculation}: ${item.maintenance.daysRemaining} jours`);
  });
  
  // Test 5: Vérification de la cohérence
  console.log('\n🔍 5. Vérification de la cohérence');
  testVehicles.forEach(vehicle => {
    console.log(`\n🚗 ${vehicle.immatriculation}:`);
    
    ['vidange', 'bougies', 'freins'].forEach(type => {
      const daysRemaining = vehicle[`${type}DaysRemaining`];
      const isInUrgent = urgentMaintenance.some(item => 
        item.vehicle.id === vehicle.id && item.type === type
      );
      const isInSpecific = [vidangeMaintenance, bougiesMaintenance, freinsMaintenance]
        .flat()
        .some(item => item.vehicle.id === vehicle.id && item.type === type);
      
      console.log(`  ${type}: ${daysRemaining} jours - Urgent: ${isInUrgent} - Spécifique: ${isInSpecific}`);
      
      // Vérifier la logique
      if (daysRemaining <= 7) {
        if (!isInUrgent) {
          console.log(`    ❌ ERREUR: ${type} devrait être en urgent mais ne l'est pas`);
        }
      } else {
        if (!isInSpecific) {
          console.log(`    ❌ ERREUR: ${type} devrait être en spécifique mais ne l'est pas`);
        }
      }
    });
  });
  
  console.log('\n🎉 Test de synchronisation terminé !');
}

// Exporter pour utilisation dans la console du navigateur
window.testSynchronisation = testSynchronisation; 