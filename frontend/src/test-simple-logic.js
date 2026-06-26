// Test simple de la logique de filtrage
const maintenanceThresholds = {
  HEAVY: { vidange: 8000, bougies: 80000, freins: 20000 },
  LIGHT: { vidange: 5000, bougies: 40000, freins: 50000 }
};

// Données de test
const testVehicles = [
  {
    id: 1,
    immatriculation: 'TEST001',
    kilometrage: 8500,
    categorie: 'HEAVY',
    historiqueEntretiens: [
      {
        type: 'vidange',
        kilometrage: 8000,
        dateEffectuee: '2024-01-15'
      }
    ],
    vidangeNextThreshold: 16000,
    vidangeDaysRemaining: 15,
    vidangeKmRemaining: 7500,
    vidangeWeeksRemaining: 15
  },
  {
    id: 2,
    immatriculation: 'TEST002',
    kilometrage: 12000,
    categorie: 'LIGHT',
    historiqueEntretiens: [],
    vidangeNextThreshold: 5000,
    vidangeDaysRemaining: -14, // Urgent
    vidangeKmRemaining: -7000,
    vidangeWeeksRemaining: -14
  }
];

function testSimpleLogic() {
  console.log('🧪 Test simple de la logique de filtrage...');
  
  // Test 1: Entretiens urgents
  console.log('\n🚨 Test 1: Entretiens urgents');
  const urgentMaintenance = [];
  
  testVehicles.forEach(vehicle => {
    const historiqueEntretiens = vehicle.historiqueEntretiens || [];
    console.log(`📊 ${vehicle.immatriculation}: ${historiqueEntretiens.length} entretiens dans l'historique`);
    
    const type = 'vidange';
    const nextThreshold = vehicle[`${type}NextThreshold`];
    const daysRemaining = vehicle[`${type}DaysRemaining`];
    
    if (nextThreshold && daysRemaining !== undefined) {
      console.log(`  ${type}: ${daysRemaining} jours restants`);
      
      // Vérifier si cet entretien a été validé récemment
      const dernierEntretien = historiqueEntretiens.find(
        entretien => entretien.type === type
      );
      
      if (dernierEntretien) {
        const kmDepuisDernierEntretien = vehicle.kilometrage - dernierEntretien.kilometrage;
        const seuil = maintenanceThresholds[vehicle.categorie][type];
        
        console.log(`    Dernier entretien: ${dernierEntretien.kilometrage} km, km depuis: ${kmDepuisDernierEntretien}/${seuil}`);
        
        // Si on n'a pas encore atteint le seuil pour le prochain entretien, exclure
        if (kmDepuisDernierEntretien < seuil) {
          console.log(`    🚫 EXCLU: Entretien validé récemment`);
          return;
        }
      }
      
      // Si l'entretien est urgent (≤ 7 jours), l'inclure
      if (daysRemaining <= 7) {
        console.log(`    🚨 INCLUS: Entretien urgent`);
        urgentMaintenance.push({
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
  
  console.log('✅ Entretiens urgents trouvés:', urgentMaintenance.length);
  urgentMaintenance.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.vehicle.immatriculation} - ${item.type}: ${item.maintenance.daysRemaining} jours`);
  });
  
  // Test 2: Entretiens non-urgents
  console.log('\n📋 Test 2: Entretiens vidange non-urgents');
  const nonUrgentMaintenance = [];
  
  testVehicles.forEach(vehicle => {
    const type = 'vidange';
    const nextThreshold = vehicle[`${type}NextThreshold`];
    const daysRemaining = vehicle[`${type}DaysRemaining`];
    
    if (nextThreshold && daysRemaining !== undefined) {
      console.log(`  ${vehicle.immatriculation} - ${type}: ${daysRemaining} jours restants`);
      
      // Vérifier si cet entretien a été validé récemment
      const historiqueEntretiens = vehicle.historiqueEntretiens || [];
      const dernierEntretien = historiqueEntretiens.find(
        entretien => entretien.type === type
      );
      
      if (dernierEntretien) {
        // Si l'entretien a été validé, l'inclure TOUJOURS
        console.log(`    ✅ INCLUS: Validé récemment`);
        nonUrgentMaintenance.push({
          vehicle: vehicle,
          maintenance: {
            nextThreshold: nextThreshold,
            daysRemaining: daysRemaining,
            kmRemaining: vehicle[`${type}KmRemaining`],
            weeksRemaining: vehicle[`${type}WeeksRemaining`]
          },
          type: type
        });
      } else if (daysRemaining > 7) {
        // Inclure les entretiens non-urgents (> 7 jours) qui n'ont pas été validés
        console.log(`    ✅ INCLUS: Non-urgent`);
        nonUrgentMaintenance.push({
          vehicle: vehicle,
          maintenance: {
            nextThreshold: nextThreshold,
            daysRemaining: daysRemaining,
            kmRemaining: vehicle[`${type}KmRemaining`],
            weeksRemaining: vehicle[`${type}WeeksRemaining`]
          },
          type: type
        });
      } else {
        console.log(`    🚫 EXCLU: Urgent et non validé`);
      }
    }
  });
  
  console.log('✅ Entretiens non-urgents trouvés:', nonUrgentMaintenance.length);
  nonUrgentMaintenance.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.vehicle.immatriculation}: ${item.maintenance.daysRemaining} jours`);
  });
  
  console.log('\n🎉 Test terminé !');
}

// Exporter pour utilisation dans la console du navigateur
window.testSimpleLogic = testSimpleLogic; 