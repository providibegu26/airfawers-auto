// Test de la boucle complète de synchronisation
async function testBoucleComplete() {
  try {
    console.log('🧪 Test de la boucle complète de synchronisation...');
    
    // 1. Récupérer les véhicules actuels
    console.log('\n📊 1. Récupération des véhicules actuels...');
    const vehiclesResponse = await fetch('http://localhost:4000/api/admin/vehicules');
    const vehiclesData = await vehiclesResponse.json();
    
    console.log(`✅ ${vehiclesData.vehicules.length} véhicules récupérés`);
    
    // 2. Analyser chaque véhicule
    vehiclesData.vehicules.forEach((vehicle, index) => {
      console.log(`\n🚗 Véhicule ${index + 1}: ${vehicle.immatriculation}`);
      console.log('Données:', {
        kilometrage: vehicle.kilometrage,
        weeklyKm: vehicle.weeklyKm,
        historiqueCount: vehicle.historiqueEntretiens?.length || 0
      });
      
      // Analyser chaque type d'entretien
      ['vidange', 'bougies', 'freins'].forEach(type => {
        const daysRemaining = vehicle[`${type}DaysRemaining`];
        const nextThreshold = vehicle[`${type}NextThreshold`];
        
        console.log(`  ${type}:`);
        console.log(`    - Jours restants: ${daysRemaining}`);
        console.log(`    - Prochain seuil: ${nextThreshold} km`);
        
        if (daysRemaining <= 7) {
          console.log(`    🚨 URGENT: Apparaît sur la page des entretiens urgents`);
        } else {
          console.log(`    ✅ Normal: Apparaît sur la page ${type}`);
        }
      });
    });
    
    // 3. Simuler une validation d'entretien
    if (vehiclesData.vehicules.length > 0) {
      const vehicle = vehiclesData.vehicules[0];
      console.log(`\n🔧 2. Simulation de validation pour ${vehicle.immatriculation}...`);
      
      // Trouver un entretien urgent à valider
      const urgentTypes = ['vidange', 'bougies', 'freins'].filter(type => {
        const daysRemaining = vehicle[`${type}DaysRemaining`];
        return daysRemaining <= 7;
      });
      
      if (urgentTypes.length > 0) {
        const typeToValidate = urgentTypes[0];
        console.log(`✅ Entretien ${typeToValidate} sera validé`);
        
        // Simuler la validation
        const validationResponse = await fetch('http://localhost:4000/api/admin/entretiens/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehiculeId: vehicle.id,
            type: typeToValidate,
            kilometrage: vehicle.kilometrage,
            description: `Test de validation ${typeToValidate}`
          })
        });
        
        if (validationResponse.ok) {
          console.log('✅ Entretien validé avec succès');
          
          // 4. Vérifier les données mises à jour
          console.log('\n🔄 3. Vérification des données mises à jour...');
          const updatedVehiclesResponse = await fetch('http://localhost:4000/api/admin/vehicules');
          const updatedVehiclesData = await updatedVehiclesResponse.json();
          
          const updatedVehicle = updatedVehiclesData.vehicules.find(v => v.id === vehicle.id);
          console.log('✅ Véhicule mis à jour:', {
            immatriculation: updatedVehicle.immatriculation,
            historiqueCount: updatedVehicle.historiqueEntretiens?.length || 0,
            [`${typeToValidate}DaysRemaining`]: updatedVehicle[`${typeToValidate}DaysRemaining`],
            [`${typeToValidate}NextThreshold`]: updatedVehicle[`${typeToValidate}NextThreshold`]
          });
          
          // 5. Vérifier la logique de synchronisation
          console.log('\n🔍 4. Vérification de la synchronisation...');
          const newDaysRemaining = updatedVehicle[`${typeToValidate}DaysRemaining`];
          
          if (newDaysRemaining > 7) {
            console.log(`✅ CORRECT: ${typeToValidate} n'apparaît plus en urgent (${newDaysRemaining} jours)`);
            console.log(`✅ CORRECT: ${typeToValidate} apparaît maintenant sur la page ${typeToValidate}`);
          } else {
            console.log(`❌ PROBLÈME: ${typeToValidate} apparaît encore en urgent (${newDaysRemaining} jours)`);
          }
          
        } else {
          console.error('❌ Erreur lors de la validation');
        }
      } else {
        console.log('ℹ️ Aucun entretien urgent trouvé pour la simulation');
      }
    }
    
    console.log('\n🎉 Test de la boucle complète terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exporter pour utilisation dans la console du navigateur
window.testBoucleComplete = testBoucleComplete; 