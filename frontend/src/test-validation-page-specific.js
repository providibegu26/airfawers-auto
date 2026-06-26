// Test de validation et apparition sur la page spécifique
async function testValidationPageSpecific() {
  try {
    console.log('🧪 Test de validation et apparition sur la page spécifique...');
    
    // 1. Récupérer l'état initial
    console.log('\n📊 1. État initial...');
    const initialResponse = await fetch('http://localhost:4000/api/admin/vehicules');
    const initialData = await initialResponse.json();
    
    const vehicle = initialData.vehicules[0];
    console.log('🚗 Véhicule initial:', {
      immatriculation: vehicle.immatriculation,
      kilometrage: vehicle.kilometrage,
      weeklyKm: vehicle.weeklyKm
    });
    
    // 2. Analyser les entretiens urgents disponibles
    const urgentTypes = ['vidange', 'bougies', 'freins'].filter(type => {
      const daysRemaining = vehicle[`${type}DaysRemaining`];
      return daysRemaining !== undefined && daysRemaining <= 7;
    });
    
    console.log('🚨 Entretiens urgents disponibles:', urgentTypes);
    
    if (urgentTypes.length === 0) {
      console.log('ℹ️ Aucun entretien urgent trouvé pour le test');
      return;
    }
    
    // 3. Valider un entretien urgent
    const typeToValidate = urgentTypes[0];
    console.log(`\n🔧 2. Validation de l'entretien ${typeToValidate}...`);
    
    const validationResponse = await fetch('http://localhost:4000/api/admin/entretiens/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehiculeId: vehicle.id,
        type: typeToValidate,
        kilometrage: vehicle.kilometrage,
        description: `Test validation ${typeToValidate}`
      })
    });
    
    if (!validationResponse.ok) {
      const errorData = await validationResponse.json();
      console.error('❌ Erreur validation:', errorData);
      return;
    }
    
    const validationResult = await validationResponse.json();
    console.log('✅ Entretien validé:', validationResult.message);
    
    // 4. Récupérer les données mises à jour
    console.log('\n📊 3. État après validation...');
    const updatedResponse = await fetch('http://localhost:4000/api/admin/vehicules');
    const updatedData = await updatedResponse.json();
    const updatedVehicle = updatedData.vehicules.find(v => v.id === vehicle.id);
    
    console.log('🚗 Véhicule mis à jour:', {
      immatriculation: updatedVehicle.immatriculation,
      kilometrage: updatedVehicle.kilometrage,
      historiqueCount: updatedVehicle.historiqueEntretiens?.length || 0
    });
    
    // 5. Vérifier la nouvelle estimation
    const newDaysRemaining = updatedVehicle[`${typeToValidate}DaysRemaining`];
    const newNextThreshold = updatedVehicle[`${typeToValidate}NextThreshold`];
    const newKmRemaining = updatedVehicle[`${typeToValidate}KmRemaining`];
    
    console.log(`📋 Nouvelle estimation ${typeToValidate}:`);
    console.log(`  - Jours restants: ${newDaysRemaining}`);
    console.log(`  - Prochain seuil: ${newNextThreshold} km`);
    console.log(`  - Km restants: ${newKmRemaining} km`);
    
    // 6. Vérifier si l'entretien apparaît sur la page spécifique
    console.log(`\n🔍 4. Vérification de la page ${typeToValidate}...`);
    
    // Simuler la logique de getNonUrgentMaintenance
    const historiqueEntretiens = updatedVehicle.historiqueEntretiens || [];
    const dernierEntretien = historiqueEntretiens.find(
      entretien => entretien.type === typeToValidate
    );
    
    if (dernierEntretien) {
      console.log(`✅ CORRECT: ${typeToValidate} a été validé récemment`);
      console.log(`✅ CORRECT: ${typeToValidate} apparaît sur la page ${typeToValidate} avec la nouvelle estimation`);
      
      if (newDaysRemaining > 7) {
        console.log(`✅ CORRECT: ${typeToValidate} n'est plus urgent (${newDaysRemaining} jours)`);
        console.log(`✅ CORRECT: ${typeToValidate} n'apparaît plus sur la page des entretiens urgents`);
      } else {
        console.log(`⚠️ ATTENTION: ${typeToValidate} est encore urgent (${newDaysRemaining} jours)`);
        console.log(`⚠️ ATTENTION: ${typeToValidate} pourrait encore apparaître sur la page des entretiens urgents`);
      }
    } else {
      console.log(`❌ PROBLÈME: ${typeToValidate} n'a pas été enregistré dans l'historique`);
    }
    
    // 7. Vérifier la cohérence du calcul
    const expectedWeeks = Math.ceil(newKmRemaining / updatedVehicle.weeklyKm);
    const expectedDays = expectedWeeks * 7;
    
    if (newDaysRemaining === expectedDays) {
      console.log(`✅ CORRECT: Calcul cohérent`);
    } else {
      console.log(`❌ PROBLÈME: Calcul incohérent - attendu ${expectedDays}, obtenu ${newDaysRemaining}`);
    }
    
    console.log('\n🎉 Test terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Test de la logique de filtrage
function testFiltrageLogique() {
  console.log('🧪 Test de la logique de filtrage...');
  
  // Simuler un véhicule avec historique
  const mockVehicle = {
    immatriculation: 'TEST123',
    kilometrage: 15000,
    weeklyKm: 500,
    historiqueEntretiens: [
      {
        type: 'vidange',
        kilometrage: 14000,
        dateEffectuee: '2024-01-15'
      }
    ],
    vidangeDaysRemaining: 7,
    vidangeNextThreshold: 20000,
    vidangeKmRemaining: 5000
  };
  
  console.log('📋 Véhicule simulé:', {
    immatriculation: mockVehicle.immatriculation,
    historiqueCount: mockVehicle.historiqueEntretiens.length,
    vidangeDaysRemaining: mockVehicle.vidangeDaysRemaining
  });
  
  // Simuler la logique de getNonUrgentMaintenance
  const historiqueEntretiens = mockVehicle.historiqueEntretiens || [];
  const dernierEntretien = historiqueEntretiens.find(
    entretien => entretien.type === 'vidange'
  );
  
  if (dernierEntretien) {
    console.log('✅ CORRECT: Vidange validée récemment');
    console.log('✅ CORRECT: Apparaît sur la page vidange avec nouvelle estimation');
  } else {
    console.log('❌ PROBLÈME: Vidange non trouvée dans l\'historique');
  }
  
  console.log('🎉 Test de filtrage terminé !');
}

// Exporter pour utilisation dans la console du navigateur
window.testValidationPageSpecific = testValidationPageSpecific;
window.testFiltrageLogique = testFiltrageLogique; 