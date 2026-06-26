import React, { useEffect, useState } from 'react';
import notificationService from '../services/notificationService';

const NotificationInitializer = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        console.log('🔔 Initialisation du service de notifications...');
        await notificationService.initialize();
        console.log('✅ Service de notifications initialisé');
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des notifications:', error);
        setIsInitialized(true); // Continuer même en cas d'erreur
      }
    };

    initializeNotifications();
  }, []);

  // Rendre les enfants même si l'initialisation n'est pas terminée
  // pour ne pas bloquer l'interface utilisateur
  return children;
};

export default NotificationInitializer; 