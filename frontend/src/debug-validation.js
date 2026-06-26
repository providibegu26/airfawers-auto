// Debug de la validation côté frontend
async function debugValidation() {
  try {
    console.log('🔍 Debug de la validation côté frontend...');
    
    // 1. Vérifier que l'API est accessible
    console.log('\n📊 1. Test de l\'API...');
    const vehiclesResponse = await fetch('http://localhost:4000/api/admin/vehicules');
    console.log('Status:', vehiclesResponse.status);
    
    if (!vehiclesResponse.ok) {
      console.error('❌ Erreur API:', vehiclesResponse.status);
      return;
    }
    
    const vehiclesData = await vehiclesResponse.json();
    console.log('✅ API accessible, véhicules:', vehiclesData.vehicules.length);
    
    // 2. Trouver un véhicule avec un entretien urgent
    const vehicleWithUrgent = vehiclesData.vehicules.find(vehicle => {
      return ['vidange', 'bougies', 'freins'].some(type => {
        const daysRemaining = vehicle[`${type}DaysRemaining`];
        return daysRemaining !== undefined && daysRemaining <= 7;
      });
    });
    
    if (!vehicleWithUrgent) {
      console.log('ℹ️ Aucun véhicule avec entretien urgent trouvé');
      return;
    }
    
    console.log('✅ Véhicule avec entretien urgent trouvé:', vehicleWithUrgent.immatriculation);
    
    // 3. Identifier l'entretien urgent
    const urgentTypes = ['vidange', 'bougies', 'freins'].filter(type => {
      const daysRemaining = vehicleWithUrgent[`${type}DaysRemaining`];
      return daysRemaining !== undefined && daysRemaining <= 7;
    });
    
    console.log('🚨 Entretiens urgents:', urgentTypes);
    
    // 4. Simuler la validation
    if (urgentTypes.length > 0) {
      const typeToValidate = urgentTypes[0];
      console.log(`\n🔧 2. Simulation de validation ${typeToValidate}...`);
      
      const validationData = {
        vehiculeId: vehicleWithUrgent.id,
        type: typeToValidate,
        kilometrage: vehicleWithUrgent.kilometrage,
        description: `Debug validation ${typeToValidate}`
      };
      
      console.log('📋 Données de validation:', validationData);
      
      const validationResponse = await fetch('http://localhost:4000/api/admin/entretiens/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validationData)
      });
      
      console.log('Status validation:', validationResponse.status);
      
      if (validationResponse.ok) {
        const result = await validationResponse.json();
        console.log('✅ Validation réussie:', result);
        
        // 5. Vérifier les données mises à jour
        console.log('\n🔄 3. Vérification des données mises à jour...');
        const updatedVehiclesResponse = await fetch('http://localhost:4000/api/admin/vehicules');
        const updatedVehiclesData = await updatedVehiclesResponse.json();
        
        const updatedVehicle = updatedVehiclesData.vehicules.find(v => v.id === vehicleWithUrgent.id);
        console.log('✅ Véhicule mis à jour:', {
          immatriculation: updatedVehicle.immatriculation,
          historiqueCount: updatedVehicle.historiqueEntretiens?.length || 0,
          [`${typeToValidate}DaysRemaining`]: updatedVehicle[`${typeToValidate}DaysRemaining`],
          [`${typeToValidate}NextThreshold`]: updatedVehicle[`${typeToValidate}NextThreshold`]
        });
        
        // 6. Vérifier si l'entretien a disparu des urgents
        const newDaysRemaining = updatedVehicle[`${typeToValidate}DaysRemaining`];
        if (newDaysRemaining > 7) {
          console.log(`✅ SUCCÈS: ${typeToValidate} n'est plus urgent (${newDaysRemaining} jours)`);
        } else {
          console.log(`❌ PROBLÈME: ${typeToValidate} est encore urgent (${newDaysRemaining} jours)`);
        }
        
      } else {
        const errorData = await validationResponse.json();
        console.error('❌ Erreur validation:', errorData);
      }
    }
    
    console.log('\n🎉 Debug terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors du debug:', error);
  }
}

// Test de la fonction de validation du frontend
function testFrontendValidation() {
  console.log('🧪 Test de la fonction de validation du frontend...');
  
  // Simuler les données de validation
  const mockPendingValidation = {
    vehiclePlate: '2006AA05',
    maintenanceType: 'vidange'
  };
  
  console.log('📋 Données de validation simulées:', mockPendingValidation);
  
  // Simuler la logique de validation
  const mockVehicle = {
    id: 4,
    immatriculation: '2006AA05',
    kilometrage: 30000
  };
  
  console.log('📋 Véhicule trouvé:', mockVehicle);
  
  // Simuler l'appel API
  const mockValidationData = {
    vehiculeId: mockVehicle.id,
    type: mockPendingValidation.maintenanceType,
    kilometrage: mockVehicle.kilometrage,
    description: `Entretien ${mockPendingValidation.maintenanceType} validé`
  };
  
  console.log('📋 Données envoyées à l\'API:', mockValidationData);
  console.log('✅ Logique de validation simulée correctement');
}

// Exporter pour utilisation dans la console du navigateur
window.debugValidation = debugValidation;
window.testFrontendValidation = testFrontendValidation; 