// Script de test pour déboguer la logique de synchronisation
// À exécuter dans la console du navigateur

console.log('🧪 TEST DE SYNCHRONISATION DES ENTRETIENS');
console.log('==========================================');

// Simulation des fonctions pour le test
function simulateGetUrgentMaintenance(vehicles) {
  const allMaintenance = [];
  
  vehicles.forEach(vehicle => {
    const historiqueEntretiens = vehicle.historiqueEntretiens || [];
    
    ['vidange', 'bougies', 'freins'].forEach(type => {
      const daysRemaining = vehicle[`${type}DaysRemaining`];
      
      if (daysRemaining !== undefined) {
        console.log(`  ${type}: ${daysRemaining} jours restants`);
        
        // RÈGLE : Inclure UNIQUEMENT les entretiens urgents (≤ 7 jours) qui n'ont PAS été validés récemment
        const dernierEntretien = historiqueEntretiens
          .filter(entretien => entretien.type.toLowerCase() === type.toLowerCase() && entretien.dateEffectuee)
          .sort((a, b) => new Date(b.dateEffectuee) - new Date(a.dateEffectuee))[0];
        
        // Vérifier si l'entretien a été validé récemment (dans les 30 derniers jours)
        const isRecentlyValidated = dernierEntretien && dernierEntretien.dateEffectuee && 
          (new Date() - new Date(dernierEntretien.dateEffectuee)) < (30 * 24 * 60 * 60 * 1000);
        
        console.log(`    Dernier entretien:`, dernierEntretien ? `${dernierEntretien.type} le ${dernierEntretien.dateEffectuee}` : 'Aucun');
        console.log(`    Validé récemment:`, isRecentlyValidated);
        
        if (daysRemaining <= 7) {
          if (!isRecentlyValidated) {
            console.log(`    🚨 INCLUS: Entretien urgent (${daysRemaining} jours) → Page urgente`);
            allMaintenance.push({
              vehicle: vehicle,
              maintenance: { daysRemaining },
              type: type
            });
          } else {
            console.log(`    🚫 EXCLU: Entretien urgent mais validé récemment (${daysRemaining} jours) → Page spécifique`);
          }
        } else {
          console.log(`    ✅ Non-urgent (${daysRemaining} jours) → Page spécifique`);
        }
      }
    });
  });
  
  return allMaintenance;
}

function simulateGetNonUrgentMaintenance(vehicles, type) {
  const maintenanceList = [];
  
  vehicles.forEach(vehicle => {
    const daysRemaining = vehicle[`${type}DaysRemaining`];
    
    if (daysRemaining !== undefined) {
      console.log(`  ${vehicle.immatriculation} - ${type}: ${daysRemaining} jours restants`);
      
      const historiqueEntretiens = vehicle.historiqueEntretiens || [];
      const dernierEntretien = historiqueEntretiens
        .filter(entretien => entretien.type.toLowerCase() === type.toLowerCase() && entretien.dateEffectuee)
        .sort((a, b) => new Date(b.dateEffectuee) - new Date(a.dateEffectuee))[0];
      
      const isRecentlyValidated = dernierEntretien && dernierEntretien.dateEffectuee && 
        (new Date() - new Date(dernierEntretien.dateEffectuee)) < (30 * 24 * 60 * 60 * 1000);
      
      console.log(`    Dernier entretien:`, dernierEntretien ? `${dernierEntretien.type} le ${dernierEntretien.dateEffectuee}` : 'Aucun');
      console.log(`    Validé récemment:`, isRecentlyValidated);
      
      if (daysRemaining <= 7) {
        if (isRecentlyValidated) {
          console.log(`    ✅ INCLUS: Entretien urgent mais validé récemment (${daysRemaining} jours) → Page ${type}`);
          maintenanceList.push({
            vehicle: vehicle,
            maintenance: { daysRemaining },
            type: type
          });
        } else {
          console.log(`    🚫 EXCLU: Urgent et non validé (${daysRemaining} jours) → Page urgente uniquement`);
        }
      } else {
        console.log(`    ✅ INCLUS: Non-urgent (${daysRemaining} jours) → Page ${type}`);
        maintenanceList.push({
          vehicle: vehicle,
          maintenance: { daysRemaining },
          type: type
        });
      }
    }
  });
  
  return maintenanceList;
}

// Cas 1 : Entretien urgent non validé
console.log('\n📋 CAS 1 : Entretien urgent non validé');
const vehicleUrgentNonValide = {
  id: 1,
  immatriculation: 'AB-123-CD',
  historiqueEntretiens: [], // aucun entretien validé
  vidangeDaysRemaining: 2,
  bougiesDaysRemaining: 45,
  freinsDaysRemaining: 120
};

console.log('Véhicule:', vehicleUrgentNonValide.immatriculation);
console.log('Vidange - jours restants:', vehicleUrgentNonValide.vidangeDaysRemaining);

const urgentResult = simulateGetUrgentMaintenance([vehicleUrgentNonValide]);
const vidangeResult = simulateGetNonUrgentMaintenance([vehicleUrgentNonValide], 'vidange');

console.log('\n🔍 RÉSULTATS :');
console.log('- Page urgente:', urgentResult.length, 'entretiens');
console.log('- Page vidange:', vidangeResult.length, 'entretiens');

if (urgentResult.length > 0) {
  console.log('✅ Entretien urgent trouvé sur la page urgente');
} else {
  console.log('❌ Entretien urgent NON trouvé sur la page urgente');
}

if (vidangeResult.length > 0) {
  console.log('❌ Entretien urgent trouvé sur la page vidange (ERREUR)');
} else {
  console.log('✅ Entretien urgent correctement exclu de la page vidange');
}

// Cas 2 : Entretien urgent validé récemment
console.log('\n📋 CAS 2 : Entretien urgent validé récemment');
const vehicleUrgentValide = {
  id: 2,
  immatriculation: 'EF-456-GH',
  historiqueEntretiens: [
    {
      id: 1,
      type: 'vidange',
      dateEffectuee: new Date().toISOString(), // validé aujourd'hui
      kilometrage: 39800
    }
  ],
  vidangeDaysRemaining: 2,
  bougiesDaysRemaining: 45,
  freinsDaysRemaining: 120
};

console.log('Véhicule:', vehicleUrgentValide.immatriculation);
console.log('Vidange - jours restants:', vehicleUrgentValide.vidangeDaysRemaining);

const urgentResult2 = simulateGetUrgentMaintenance([vehicleUrgentValide]);
const vidangeResult2 = simulateGetNonUrgentMaintenance([vehicleUrgentValide], 'vidange');

console.log('\n🔍 RÉSULTATS :');
console.log('- Page urgente:', urgentResult2.length, 'entretiens');
console.log('- Page vidange:', vidangeResult2.length, 'entretiens');

if (urgentResult2.length === 0) {
  console.log('✅ Entretien urgent correctement exclu de la page urgente');
} else {
  console.log('❌ Entretien urgent trouvé sur la page urgente (ERREUR)');
}

if (vidangeResult2.length > 0) {
  console.log('✅ Entretien urgent validé trouvé sur la page vidange');
} else {
  console.log('❌ Entretien urgent validé NON trouvé sur la page vidange (ERREUR)');
}

console.log('\n🎯 SYNTHÈSE :');
console.log('Cas 1 (urgent non validé) :', urgentResult.length > 0 && vidangeResult.length === 0 ? '✅ CORRECT' : '❌ ERREUR');
console.log('Cas 2 (urgent validé) :', urgentResult2.length === 0 && vidangeResult2.length > 0 ? '✅ CORRECT' : '❌ ERREUR');

// Instructions pour exécuter le test
console.log('\n📝 POUR EXÉCUTER CE TEST :');
console.log('1. Ouvre la console du navigateur (F12)');
console.log('2. Copie-colle tout ce script');
console.log('3. Appuie sur Entrée');
console.log('4. Vérifie les résultats ci-dessus'); 