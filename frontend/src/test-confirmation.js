// Test de la confirmation de validation
async function testConfirmation() {
  try {
    console.log('🧪 Test de la confirmation de validation...');
    
    // 1. Récupérer les véhicules
    console.log('\n📊 1. Récupération des véhicules...');
    const vehiclesResponse = await fetch('http://localhost:4000/api/admin/vehicules');
    const vehiclesData = await vehiclesResponse.json();
    
    if (!vehiclesData.vehicules || vehiclesData.vehicules.length === 0) {
      console.log('❌ Aucun véhicule trouvé');
      return;
    }
    
    const vehicle = vehiclesData.vehicules[0];
    console.log('✅ Véhicule trouvé:', vehicle.immatriculation);
    
    // 2. Simuler une validation
    console.log('\n🔧 2. Simulation de validation...');
    const validationData = {
      vehiculeId: vehicle.id,
      type: 'vidange',
      kilometrage: vehicle.kilometrage,
      description: 'Test de validation'
    };
    
    console.log('📋 Données de validation:', validationData);
    
    // 3. Appeler l'API de validation
    console.log('\n🔄 3. Appel de l\'API de validation...');
    const validationResponse = await fetch('http://localhost:4000/api/admin/entretiens/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validationData)
    });
    
    console.log('📊 Status de la réponse:', validationResponse.status);
    
    if (!validationResponse.ok) {
      const errorData = await validationResponse.json();
      console.error('❌ Erreur validation:', errorData);
      return;
    }
    
    const result = await validationResponse.json();
    console.log('✅ Résultat de la validation:', result);
    
    // 4. Vérifier les données mises à jour
    console.log('\n🔄 4. Vérification des données mises à jour...');
    const updatedVehiclesResponse = await fetch('http://localhost:4000/api/admin/vehicules');
    const updatedVehiclesData = await updatedVehiclesResponse.json();
    
    const updatedVehicle = updatedVehiclesData.vehicules.find(v => v.id === vehicle.id);
    console.log('✅ Véhicule mis à jour:', {
      immatriculation: updatedVehicle.immatriculation,
      kilometrage: updatedVehicle.kilometrage,
      historiqueCount: updatedVehicle.historiqueEntretiens?.length || 0,
      vidangeDaysRemaining: updatedVehicle.vidangeDaysRemaining,
      vidangeNextThreshold: updatedVehicle.vidangeNextThreshold
    });
    
    // 5. Vérifier l'historique
    if (updatedVehicle.historiqueEntretiens && updatedVehicle.historiqueEntretiens.length > 0) {
      console.log('📋 Historique des entretiens:');
      updatedVehicle.historiqueEntretiens.forEach(entretien => {
        console.log(`  - ${entretien.type}: ${entretien.kilometrage} km (${entretien.dateEffectuee})`);
      });
    }
    
    console.log('\n🎉 Test de confirmation terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Test de la logique de filtrage
function testFiltering() {
  console.log('🧪 Test de la logique de filtrage...');
  
  // Données de test
  const testVehicle = {
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
  };
  
  console.log('📊 Véhicule de test:', {
    immatriculation: testVehicle.immatriculation,
    kilometrage: testVehicle.kilometrage,
    historiqueCount: testVehicle.historiqueEntretiens.length,
    vidangeDaysRemaining: testVehicle.vidangeDaysRemaining
  });
  
  // Test de filtrage
  const historiqueEntretiens = testVehicle.historiqueEntretiens;
  const dernierEntretien = historiqueEntretiens.find(entretien => entretien.type === 'vidange');
  
  if (dernierEntretien) {
    const kmDepuisDernierEntretien = testVehicle.kilometrage - dernierEntretien.kilometrage;
    const seuil = 8000; // vidange pour HEAVY
    
    console.log('🔍 Test de filtrage:');
    console.log(`  - Dernier entretien: ${dernierEntretien.kilometrage} km`);
    console.log(`  - Km depuis: ${kmDepuisDernierEntretien}`);
    console.log(`  - Seuil: ${seuil}`);
    console.log(`  - Doit être exclu: ${kmDepuisDernierEntretien < seuil ? 'OUI' : 'NON'}`);
  }
  
  console.log('✅ Test de filtrage terminé !');
}

// Exporter pour utilisation dans la console du navigateur
window.testConfirmation = testConfirmation;
window.testFiltering = testFiltering; 