import React, { useEffect } from 'react';
import chauffeurNotificationService from '../../services/chauffeurNotificationService';

const ChauffeurNotificationInitializer = () => {
  useEffect(() => {
    const initializeNotifications = async () => {
      console.log('🔔 Initialisation du service de notifications chauffeur...');
      
      try {
        await chauffeurNotificationService.initialize();
        console.log('✅ Service de notifications chauffeur initialisé');
      } catch (error) {
        console.error('❌ Erreur initialisation notifications chauffeur:', error);
      }
    };

    initializeNotifications();

    // Nettoyer lors du démontage
    return () => {
      chauffeurNotificationService.stopPeriodicCheck();
    };
  }, []);

  return null; // Ce composant ne rend rien visuellement
};

export default ChauffeurNotificationInitializer;
