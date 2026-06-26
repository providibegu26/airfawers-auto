// Test de la logique de filtrage des entretiens
import { getUrgentMaintenance, getNonUrgentMaintenance } from './services/maintenanceService.js';

// Données de test
const testVehicles = [
  {
    id: 1,
    immatriculation: 'TEST001',
    kilometrage: 8500,
    weeklyKm: 500,
    categorie: 'HEAVY',
    historiqueEntretiens: [
      {
        type: 'vidange',
        kilometrage: 8000,
        dateEffectuee: '2024-01-15'
      }
    ],
    // Estimations calculées côté serveur
    vidangeNextThreshold: 16000,
    vidangeDaysRemaining: 15,
    vidangeKmRemaining: 7500,
    vidangeWeeksRemaining: 15,
    bougiesNextThreshold: 80000,
    bougiesDaysRemaining: 143,
    bougiesKmRemaining: 71500,
    bougiesWeeksRemaining: 143,
    freinsNextThreshold: 20000,
    freinsDaysRemaining: 23,
    freinsKmRemaining: 11500,
    freinsWeeksRemaining: 23
  },
  {
    id: 2,
    immatriculation: 'TEST002',
    kilometrage: 12000,
    weeklyKm: 500,
    categorie: 'LIGHT',
    historiqueEntretiens: [],
    // Estimations calculées côté serveur
    vidangeNextThreshold: 5000,
    vidangeDaysRemaining: -14, // Urgent
    vidangeKmRemaining: -7000,
    vidangeWeeksRemaining: -14,
    bougiesNextThreshold: 40000,
    bougiesDaysRemaining: 56,
    bougiesKmRemaining: 28000,
    bougiesWeeksRemaining: 56,
    freinsNextThreshold: 50000,
    freinsDaysRemaining: 70,
    freinsKmRemaining: 38000,
    freinsWeeksRemaining: 70
  }
];

function testMaintenanceLogic() {
  console.log('🧪 Test de la logique de filtrage des entretiens...');
  
  // Test 1: Entretiens urgents
  console.log('\n🚨 Test 1: Entretiens urgents');
  const urgentMaintenance = getUrgentMaintenance(testVehicles);
  console.log('✅ Entretiens urgents trouvés:', urgentMaintenance.length);
  urgentMaintenance.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.vehicle.immatriculation} - ${item.type}: ${item.maintenance.daysRemaining} jours`);
  });
  
  // Test 2: Entretiens vidange non-urgents
  console.log('\n📋 Test 2: Entretiens vidange non-urgents');
  const vidangeMaintenance = getNonUrgentMaintenance(testVehicles, 'vidange');
  console.log('✅ Entretiens vidange non-urgents trouvés:', vidangeMaintenance.length);
  vidangeMaintenance.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.vehicle.immatriculation}: ${item.maintenance.daysRemaining} jours`);
  });
  
  // Test 3: Entretiens bougies non-urgents
  console.log('\n📋 Test 3: Entretiens bougies non-urgents');
  const bougiesMaintenance = getNonUrgentMaintenance(testVehicles, 'bougies');
  console.log('✅ Entretiens bougies non-urgents trouvés:', bougiesMaintenance.length);
  bougiesMaintenance.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.vehicle.immatriculation}: ${item.maintenance.daysRemaining} jours`);
  });
  
  console.log('\n🎉 Test terminé !');
}

// Exporter pour utilisation dans la console du navigateur
window.testMaintenanceLogic = testMaintenanceLogic; 