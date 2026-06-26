// Test du formatage des données
function testDataFormat() {
  console.log('🧪 Test du formatage des données...');
  
  // Données de test avec des valeurs manquantes
  const testData = [
    {
      immatriculation: 'ABC123',
      marque: 'Renault',
      modele: 'Clio',
      chauffeur: 'Jean Dupont',
      type: 'vidange',
      kilometrage: 8500,
      dateEntretien: '2024-01-15',
      joursRestants: 5
    },
    {
      immatriculation: 'XYZ789',
      marque: 'Peugeot',
      modele: '208',
      chauffeur: null, // Valeur manquante
      type: 'bougies',
      kilometrage: undefined, // Valeur manquante
      dateEntretien: null, // Valeur manquante
      joursRestants: undefined // Valeur manquante
    },
    {
      immatriculation: 'DEF456',
      marque: null, // Valeur manquante
      modele: undefined, // Valeur manquante
      chauffeur: 'Marie Martin',
      type: 'freins',
      kilometrage: 12000,
      dateEntretien: '2024-01-20',
      joursRestants: -2
    }
  ];
  
  console.log('📊 Données de test:');
  testData.forEach((item, index) => {
    console.log(`\nItem ${index + 1}:`);
    console.log('  - immatriculation:', item.immatriculation || 'N/A');
    console.log('  - marque:', item.marque || 'N/A');
    console.log('  - modele:', item.modele || 'N/A');
    console.log('  - chauffeur:', item.chauffeur || 'Non assigné');
    console.log('  - type:', item.type || 'N/A');
    console.log('  - kilometrage:', item.kilometrage ? item.kilometrage.toLocaleString('fr-FR') : '0');
    console.log('  - dateEntretien:', item.dateEntretien || 'N/A');
    console.log('  - joursRestants:', item.joursRestants || 0);
    
    // Test de la logique de statut
    const joursRestants = item.joursRestants || 0;
    let statusText;
    
    if (joursRestants < 0) {
      statusText = 'En retard';
    } else if (joursRestants <= 7) {
      statusText = 'Urgent';
    } else if (joursRestants <= 14) {
      statusText = 'À venir';
    } else {
      statusText = 'Normal';
    }
    
    console.log('  - statut:', statusText);
  });
  
  console.log('\n✅ Test de formatage terminé !');
}

// Test de la fonction formatMaintenanceData
function testFormatMaintenanceData() {
  console.log('🧪 Test de formatMaintenanceData...');
  
  // Données de test avec des objets maintenance
  const testMaintenanceData = [
    {
      vehicle: {
        immatriculation: 'ABC123',
        marque: 'Renault',
        modele: 'Clio',
        chauffeur: {
          nom: 'Jean Dupont'
        }
      },
      maintenance: {
        daysRemaining: 5,
        nextThreshold: 16000
      },
      type: 'vidange'
    },
    {
      vehicle: {
        immatriculation: 'XYZ789',
        marque: 'Peugeot',
        modele: '208',
        chauffeur: null
      },
      maintenance: {
        daysRemaining: undefined,
        nextThreshold: 80000
      },
      type: 'bougies'
    }
  ];
  
  console.log('📊 Données maintenance de test:');
  testMaintenanceData.forEach((item, index) => {
    console.log(`\nItem ${index + 1}:`);
    console.log('  - immatriculation:', item.vehicle.immatriculation);
    console.log('  - marque:', item.vehicle.marque);
    console.log('  - modele:', item.vehicle.modele);
    console.log('  - chauffeur:', item.vehicle.chauffeur?.nom || 'Non assigné');
    console.log('  - type:', item.type);
    console.log('  - joursRestants:', item.maintenance.daysRemaining || 0);
    console.log('  - nextThreshold:', item.maintenance.nextThreshold);
  });
  
  console.log('\n✅ Test de formatMaintenanceData terminé !');
}

// Exporter pour utilisation dans la console du navigateur
window.testDataFormat = testDataFormat;
window.testFormatMaintenanceData = testFormatMaintenanceData; 