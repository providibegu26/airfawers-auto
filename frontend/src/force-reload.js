// Script pour forcer le rechargement complet des données
async function forceReload() {
  try {
    console.log('🔄 Force reload des données...');
    
    // 1. Recharger les véhicules depuis le serveur
    const vehiclesResponse = await fetch('http://localhost:4000/api/admin/vehicules');
    const vehiclesData = await vehiclesResponse.json();
    
    console.log('✅ Véhicules rechargés:', vehiclesData.vehicules.length);
    
    // 2. Afficher les détails de chaque véhicule
    vehiclesData.vehicules.forEach((vehicle, index) => {
      console.log(`\n🚗 Véhicule ${index + 1}:`, {
        immatriculation: vehicle.immatriculation,
        kilometrage: vehicle.kilometrage,
        historiqueCount: vehicle.historiqueEntretiens?.length || 0,
        estimations: {
          vidangeNextThreshold: vehicle.vidangeNextThreshold,
          vidangeDaysRemaining: vehicle.vidangeDaysRemaining,
          bougiesNextThreshold: vehicle.bougiesNextThreshold,
          bougiesDaysRemaining: vehicle.bougiesDaysRemaining,
          freinsNextThreshold: vehicle.freinsNextThreshold,
          freinsDaysRemaining: vehicle.freinsDaysRemaining
        }
      });
      
      if (vehicle.historiqueEntretiens && vehicle.historiqueEntretiens.length > 0) {
        console.log('  📋 Historique des entretiens:');
        vehicle.historiqueEntretiens.forEach(entretien => {
          console.log(`    - ${entretien.type}: ${entretien.kilometrage} km (${entretien.dateEffectuee})`);
        });
      }
    });
    
    // 3. Calculer les entretiens urgents
    console.log('\n🚨 Calcul des entretiens urgents...');
    const urgentMaintenance = [];
    
    vehiclesData.vehicules.forEach(vehicle => {
      const historiqueEntretiens = vehicle.historiqueEntretiens || [];
      
      ['vidange', 'bougies', 'freins'].forEach(type => {
        const nextThreshold = vehicle[`${type}NextThreshold`];
        const daysRemaining = vehicle[`${type}DaysRemaining`];
        
        if (nextThreshold && daysRemaining !== undefined) {
          // Vérifier si cet entretien a été validé récemment
          const dernierEntretien = historiqueEntretiens.find(
            entretien => entretien.type === type
          );
          
          if (dernierEntretien) {
            const kmDepuisDernierEntretien = vehicle.kilometrage - dernierEntretien.kilometrage;
            const seuil = type === 'vidange' ? 8000 : type === 'bougies' ? 80000 : 20000;
            
            // Si on n'a pas encore atteint le seuil, exclure
            if (kmDepuisDernierEntretien < seuil) {
              console.log(`  🚫 ${vehicle.immatriculation} - ${type}: EXCLU (validé récemment)`);
              return;
            }
          }
          
          // Si l'entretien est urgent (≤ 7 jours), l'inclure
          if (daysRemaining <= 7) {
            console.log(`  🚨 ${vehicle.immatriculation} - ${type}: INCLUS (${daysRemaining} jours)`);
            urgentMaintenance.push({
              vehicle: vehicle,
              type: type,
              daysRemaining: daysRemaining
            });
          }
        }
      });
    });
    
    console.log('\n📋 Résumé:');
    console.log(`- Véhicules: ${vehiclesData.vehicules.length}`);
    console.log(`- Entretiens urgents: ${urgentMaintenance.length}`);
    
    urgentMaintenance.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.vehicle.immatriculation} - ${item.type}: ${item.daysRemaining} jours`);
    });
    
    console.log('\n🎉 Force reload terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors du force reload:', error);
  }
}

// Exporter pour utilisation dans la console du navigateur
window.forceReload = forceReload; 