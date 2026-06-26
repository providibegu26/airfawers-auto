// Test simple de validation d'entretien
async function testValidation() {
  try {
    console.log('🧪 Test de validation d\'entretien...');
    
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
    console.log('📊 Données avant validation:', {
      kilometrage: vehicle.kilometrage,
      historiqueCount: vehicle.historiqueEntretiens?.length || 0,
      vidangeDaysRemaining: vehicle.vidangeDaysRemaining
    });
    
    // 2. Valider un entretien vidange
    console.log('\n🔧 2. Validation d\'un entretien vidange...');
    const validationResponse = await fetch('http://localhost:4000/api/admin/entretiens/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehiculeId: vehicle.id,
        type: 'vidange',
        kilometrage: vehicle.kilometrage,
        description: 'Test de validation'
      })
    });
    
    if (!validationResponse.ok) {
      const errorData = await validationResponse.json();
      console.error('❌ Erreur validation:', errorData);
      return;
    }
    
    const validationData = await validationResponse.json();
    console.log('✅ Entretien validé:', validationData);
    
    // 3. Récupérer les véhicules mis à jour
    console.log('\n🔄 3. Récupération des véhicules mis à jour...');
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
    
    // 4. Vérifier l'historique
    console.log('📋 Historique des entretiens:', updatedVehicle.historiqueEntretiens);
    
    console.log('🎉 Test terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exporter pour utilisation dans la console du navigateur
window.testValidation = testValidation; 