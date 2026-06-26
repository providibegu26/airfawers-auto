// Script de débogage pour les entretiens
import { fetchVehicles, getUrgentMaintenance, getNonUrgentMaintenance } from './services/maintenanceService.js';

async function debugMaintenance() {
  try {
    console.log('🔍 Débogage des entretiens...');
    
    // 1. Récupérer les véhicules
    console.log('\n📊 1. Récupération des véhicules...');
    const vehicles = await fetchVehicles();
    console.log('✅ Véhicules récupérés:', vehicles.length);
    
    // 2. Afficher les détails de chaque véhicule
    vehicles.forEach((vehicle, index) => {
      console.log(`\n🚗 Véhicule ${index + 1}:`, {
        immatriculation: vehicle.immatriculation,
        kilometrage: vehicle.kilometrage,
        weeklyKm: vehicle.weeklyKm,
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
    console.log('\n🚨 2. Calcul des entretiens urgents...');
    const urgentMaintenance = getUrgentMaintenance(vehicles);
    console.log('✅ Entretiens urgents trouvés:', urgentMaintenance.length);
    
    urgentMaintenance.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.vehicle.immatriculation} - ${item.type}: ${item.maintenance.daysRemaining} jours restants`);
    });
    
    // 4. Calculer les entretiens non-urgents (vidange)
    console.log('\n📋 3. Calcul des entretiens vidange non-urgents...');
    const vidangeMaintenance = getNonUrgentMaintenance(vehicles, 'vidange');
    console.log('✅ Entretiens vidange non-urgents trouvés:', vidangeMaintenance.length);
    
    vidangeMaintenance.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.vehicle.immatriculation}: ${item.maintenance.daysRemaining} jours restants`);
    });
    
    console.log('\n🎉 Débogage terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors du débogage:', error);
  }
}

// Exporter pour utilisation dans la console du navigateur
window.debugMaintenance = debugMaintenance; 