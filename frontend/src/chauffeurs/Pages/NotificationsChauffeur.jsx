import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExclamationTriangle, 
  faTools,
  faCar,
  faCheckCircle,
  faBell,
  faTrash,
  faSync,
  faCog,
  faCircle,
  faGasPump
} from '@fortawesome/free-solid-svg-icons';
import chauffeurNotificationService from '../../services/chauffeurNotificationService';

const NotificationsChauffeur = () => {
  const [notifications, setNotifications] = useState([]);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initializeNotifications();
    
    // Mettre à jour les notifications toutes les 30 secondes
    const interval = setInterval(() => {
      setNotifications(chauffeurNotificationService.getNotifications());
      setServiceStatus(chauffeurNotificationService.getStatus());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const initializeNotifications = async () => {
    setIsInitializing(true);
    
    try {
      // Initialiser le service de notifications
      await chauffeurNotificationService.initialize();
      
      // Charger les notifications existantes
      setNotifications(chauffeurNotificationService.getNotifications());
      setServiceStatus(chauffeurNotificationService.getStatus());
      
      // Vérifier immédiatement les notifications
      await chauffeurNotificationService.manualCheck();
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des notifications:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleManualCheck = async () => {
    await chauffeurNotificationService.manualCheck();
    setNotifications(chauffeurNotificationService.getNotifications());
    setServiceStatus(chauffeurNotificationService.getStatus());
  };

  const handleMarkAsRead = async (notificationId) => {
    await chauffeurNotificationService.markAsRead(notificationId);
    setNotifications(chauffeurNotificationService.getNotifications());
  };

  const handleRemoveNotification = (notificationId) => {
    chauffeurNotificationService.removeNotification(notificationId);
    setNotifications(chauffeurNotificationService.getNotifications());
  };

  const handleClearAll = async () => {
    await chauffeurNotificationService.clearAllNotifications();
    setNotifications(chauffeurNotificationService.getNotifications());
  };

  const getIcon = (type, fuelAttributionId) => {
    // Si c'est une notification de carburant
    if (fuelAttributionId) {
      return faGasPump;
    }
    
    // Sinon, utiliser la logique existante pour les entretiens
    switch(type) {
      case 'urgent': return faExclamationTriangle;
      case 'warning': return faTools;
      case 'info': return faCar;
      default: return faBell;
    }
  };

  const getColor = (type, fuelAttributionId) => {
    // Si c'est une notification de carburant
    if (fuelAttributionId) {
      return 'text-green-500';
    }
    
    // Sinon, utiliser la logique existante pour les entretiens
    switch(type) {
      case 'urgent': return 'text-red-500';
      case 'warning': return 'text-orange-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getBackgroundColor = (type, read, fuelAttributionId) => {
    if (read) return 'bg-white hover:bg-gray-50';
    
    // Si c'est une notification de carburant
    if (fuelAttributionId) {
      return 'bg-green-50 hover:bg-green-100 border-l-4 border-green-500';
    }
    
    // Sinon, utiliser la logique existante pour les entretiens
    switch(type) {
      case 'urgent': return 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500';
      case 'warning': return 'bg-orange-50 hover:bg-orange-100 border-l-4 border-orange-500';
      case 'info': return 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500';
      default: return 'bg-gray-50 hover:bg-gray-100 border-l-4 border-gray-500';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays} jour(s)`;
    return time.toLocaleDateString('fr-FR');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FontAwesomeIcon icon={faCog} className="text-2xl text-gray-400 animate-spin mb-4" />
          <p className="text-gray-600">Initialisation des notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-2">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount} {unreadCount === 1 ? 'nouvelle' : 'nouvelles'}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleManualCheck}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
            title="Vérifier manuellement"
          >
            <FontAwesomeIcon icon={faSync} className="text-sm" />
            <span>Actualiser</span>
          </button>
          
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center space-x-2"
              title="Supprimer toutes les notifications"
            >
              <FontAwesomeIcon icon={faTrash} className="text-sm" />
              <span>Tout effacer</span>
            </button>
          )}
        </div>
      </div>

      {/* Statut du service */}
      {serviceStatus && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-4 border border-blue-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">Statut:</span>
              <span className={`flex items-center space-x-1 ${serviceStatus.permission === 'granted' ? 'text-green-600' : 'text-red-600'}`}>
                <FontAwesomeIcon icon={serviceStatus.permission === 'granted' ? faCheckCircle : faCircle} className="text-xs" />
                <span>{serviceStatus.permission === 'granted' ? 'Activé' : 'Désactivé'}</span>
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Total:</span>
              <span className="ml-2 text-gray-600 font-semibold">{serviceStatus.notificationCount}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Non lues:</span>
              <span className="ml-2 text-gray-600 font-semibold">{serviceStatus.unreadCount}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Véhicule:</span>
              <span className="ml-2 text-gray-600 font-semibold">{serviceStatus.vehicle}</span>
            </div>
          </div>
        </div>
      )}

      {/* Liste des notifications */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FontAwesomeIcon icon={faBell} className="text-6xl mb-4 text-gray-300" />
            <p className="text-xl font-medium mb-2 text-gray-400">Aucune notification</p>
            <p className="text-sm text-gray-400">Les notifications d'entretien et de carburant de votre véhicule apparaîtront ici automatiquement</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 transition-all duration-200 ${getBackgroundColor(notification.type, notification.read, notification.fuelAttributionId)}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 mt-1 ${getColor(notification.type, notification.fuelAttributionId)}`}>
                    <FontAwesomeIcon icon={getIcon(notification.type, notification.fuelAttributionId)} className="text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <p className={`text-base font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <FontAwesomeIcon icon={faCircle} className="text-xs text-red-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                        <div className="flex items-center space-x-6 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <FontAwesomeIcon icon={faCar} className="text-xs" />
                            <span>{notification.vehicle}</span>
                          </span>
                          
                          {/* Affichage spécifique pour les notifications de carburant */}
                          {notification.fuelAttributionId ? (
                            <>
                              <span className="flex items-center space-x-1">
                                <FontAwesomeIcon icon={faGasPump} className="text-xs" />
                                <span>{notification.quantity}L</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                                <span>Carburant attribué</span>
                              </span>
                            </>
                          ) : (
                            /* Affichage pour les notifications d'entretien */
                            <>
                              <span className="flex items-center space-x-1">
                                <FontAwesomeIcon icon={faTools} className="text-xs" />
                                <span>{chauffeurNotificationService.getTypeLabel(notification.maintenanceType)}</span>
                              </span>
                              {notification.daysRemaining && (
                                <span className="flex items-center space-x-1">
                                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-xs" />
                                  <span>{notification.daysRemaining} jour(s) restant(s)</span>
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 ml-4">
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors duration-200"
                            >
                              Marquer comme lu
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveNotification(notification.id)}
                            className="text-xs text-red-500 hover:text-red-700 transition-colors duration-200"
                            title="Supprimer"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsChauffeur;
