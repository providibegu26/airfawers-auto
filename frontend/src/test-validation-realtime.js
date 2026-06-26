// Test de validation en temps réel
function testValidationRealtime() {
  console.log('🧪 Test de validation en temps réel...');
  
  // 1. Vérifier que les fonctions sont disponibles
  console.log('\n📊 1. Vérification des fonctions...');
  
  // Vérifier si on est sur la page des entretiens urgents
  const currentPath = window.location.pathname;
  console.log('📍 Page actuelle:', currentPath);
  
  if (!currentPath.includes('urgents')) {
    console.log('⚠️ Vous devez être sur la page des entretiens urgents');
    console.log('🔗 Allez sur: http://localhost:5173/entretiens-urgents');
    return;
  }
  
  // 2. Vérifier les données de la page
  console.log('\n📋 2. Vérification des données de la page...');
  
  // Essayer de récupérer les données depuis le DOM
  const tableRows = document.querySelectorAll('tbody tr');
  console.log('📊 Nombre de lignes dans le tableau:', tableRows.length);
  
  if (tableRows.length === 0) {
    console.log('⚠️ Aucune donnée dans le tableau');
    return;
  }
  
  // 3. Analyser chaque ligne
  tableRows.forEach((row, index) => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 7) {
      const immatriculation = cells[0]?.textContent?.trim();
      const type = cells[2]?.textContent?.trim();
      const joursRestants = cells[5]?.textContent?.trim();
      
      console.log(`  Ligne ${index + 1}: ${immatriculation} - ${type} - ${joursRestants}`);
    }
  });
  
  // 4. Vérifier les boutons de validation
  console.log('\n🔘 3. Vérification des boutons de validation...');
  const validateButtons = document.querySelectorAll('button');
  const validationButtons = Array.from(validateButtons).filter(btn => 
    btn.textContent?.includes('Valider')
  );
  
  console.log('📊 Boutons de validation trouvés:', validationButtons.length);
  
  validationButtons.forEach((btn, index) => {
    console.log(`  Bouton ${index + 1}:`, {
      text: btn.textContent,
      disabled: btn.disabled,
      className: btn.className
    });
  });
  
  // 5. Simuler un clic sur le premier bouton de validation
  if (validationButtons.length > 0) {
    console.log('\n🔧 4. Simulation de clic sur le premier bouton...');
    const firstButton = validationButtons[0];
    
    console.log('📋 Avant le clic - Bouton:', {
      text: firstButton.textContent,
      disabled: firstButton.disabled
    });
    
    // Simuler le clic
    firstButton.click();
    
    console.log('✅ Clic simulé');
    
    // Vérifier si le modal apparaît
    setTimeout(() => {
      const modal = document.querySelector('.fixed.inset-0');
      if (modal) {
        console.log('✅ Modal détecté');
        
        // Vérifier les boutons du modal
        const modalButtons = modal.querySelectorAll('button');
        console.log('📊 Boutons du modal:', modalButtons.length);
        
        modalButtons.forEach((btn, index) => {
          console.log(`  Bouton modal ${index + 1}:`, {
            text: btn.textContent,
            className: btn.className
          });
        });
        
        // Simuler un clic sur le bouton de confirmation
        const confirmButton = Array.from(modalButtons).find(btn => 
          btn.textContent?.includes('Valider') || btn.textContent?.includes('Confirmer')
        );
        
        if (confirmButton) {
          console.log('🔧 Simulation de clic sur le bouton de confirmation...');
          confirmButton.click();
          console.log('✅ Clic sur confirmation simulé');
        } else {
          console.log('❌ Bouton de confirmation non trouvé');
        }
        
      } else {
        console.log('❌ Modal non détecté après le clic');
      }
    }, 1000);
    
  } else {
    console.log('❌ Aucun bouton de validation trouvé');
  }
  
  console.log('\n🎉 Test terminé !');
}

// Test de l'état du modal
function testModalState() {
  console.log('🔍 Test de l\'état du modal...');
  
  // Vérifier si un modal est présent
  const modals = document.querySelectorAll('.fixed.inset-0');
  console.log('📊 Modals trouvés:', modals.length);
  
  modals.forEach((modal, index) => {
    console.log(`Modal ${index + 1}:`, {
      visible: modal.style.display !== 'none',
      className: modal.className,
      children: modal.children.length
    });
  });
  
  // Vérifier les overlays
  const overlays = document.querySelectorAll('[class*="bg-black"]');
  console.log('📊 Overlays trouvés:', overlays.length);
  
  // Vérifier les boutons de validation dans le modal
  const modalButtons = document.querySelectorAll('.fixed button');
  console.log('📊 Boutons dans les modals:', modalButtons.length);
  
  modalButtons.forEach((btn, index) => {
    console.log(`Bouton modal ${index + 1}:`, {
      text: btn.textContent?.trim(),
      className: btn.className,
      disabled: btn.disabled
    });
  });
}

// Exporter pour utilisation dans la console du navigateur
window.testValidationRealtime = testValidationRealtime;
window.testModalState = testModalState; 