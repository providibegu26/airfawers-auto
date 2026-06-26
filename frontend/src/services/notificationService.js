import { apiPath } from "@/config/api";

// Service de notifications pour les entretiens et le carburant
class NotificationService {
  constructor() {
    this.notifications = [];
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.checkInterval = null;
    this.lastCheck = new Date();
    this.lastFuelCheck = new Date();
  }

  // Initialiser le service de notifications
  async initialize() {
    if (!this.isSupported) {
      console.log('❌ Notifications non supportées par ce navigateur');
      return false;
    }

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    if (this.permission === 'granted') {
      console.log('✅ Notifications push activées');
      this.startPeriodicCheck();
      return true;
    } else {
      console.log('❌ Permissions de notifications refusées');
      return false;
    }
  }

  // Démarrer la vérification périodique des entretiens et du carburant
  startPeriodicCheck() {
    // Vérifier toutes les 5 minutes
    this.checkInterval = setInterval(() => {
      this.checkMaintenanceNotifications();
      this.checkFuelCollectionNotifications();
    }, 5 * 60 * 1000);

    // Vérifier immédiatement au démarrage
    this.checkMaintenanceNotifications();
    this.checkFuelCollectionNotifications();
  }

  // Arrêter la vérification périodique
  stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Vérifier les notifications d'entretien
  async checkMaintenanceNotifications() {
    try {
      const response = await fetch(apiPath("/admin/vehicules"));
      const data = await response.json();
      
      if (!data.vehicules) return;

      const notifications = [];
      
      data.vehicules.forEach(vehicle => {
        // Vérifier les différents types d'entretien
        const maintenanceTypes = ['vidange', 'categorie_b', 'categorie_c'];
        
        maintenanceTypes.forEach(type => {
          const daysRemaining = vehicle[`${type}DaysRemaining`];
          
          if (daysRemaining !== undefined && daysRemaining !== null) {
            // Notification à 14 jours
            if (daysRemaining === 14) {
              notifications.push({
                type: 'warning',
                title: `Entretien ${this.getTypeLabel(type)} approche`,
                message: `Il reste 14 jours pour l'entretien ${this.getTypeLabel(type)} du véhicule ${vehicle.immatriculation}`,
                vehicle: vehicle.immatriculation,
                maintenanceType: type,
                daysRemaining: daysRemaining,
                timestamp: new Date()
              });
            }
            
            // Notification urgente (7 jours ou moins)
            if (daysRemaining <= 7 && daysRemaining > 0) {
              notifications.push({
                type: 'urgent',
                title: `Entretien ${this.getTypeLabel(type)} urgent !`,
                message: `Il ne reste que ${daysRemaining} jour(s) pour l'entretien ${this.getTypeLabel(type)} du véhicule ${vehicle.immatriculation}`,
                vehicle: vehicle.immatriculation,
                maintenanceType: type,
                daysRemaining: daysRemaining,
                timestamp: new Date()
              });
            }
          }
        });
      });

      // Envoyer les notifications push
      notifications.forEach(notification => {
        this.sendPushNotification(notification);
        this.addToInternalNotifications(notification);
      });

      this.lastCheck = new Date();
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des notifications:', error);
    }
  }

  // Vérifier les notifications de récupération de carburant
  async checkFuelCollectionNotifications() {
    try {
      // Récupérer les confirmations de récupération de carburant récentes
      const response = await fetch(apiPath("/admin/carburant/confirmations-recentes"));
      
      if (!response.ok) {
        console.log('⚠️ API confirmations carburant non disponible');
        return;
      }

      const data = await response.json();
      
      if (!data.confirmations) return;

      const notifications = [];
      
      data.confirmations.forEach(confirmation => {
        // Créer une notification pour chaque confirmation
        notifications.push({
          type: 'info',
          title: 'Carburant récupéré par le chauffeur',
          message: `Le chauffeur ${confirmation.chauffeurNom} a confirmé la récupération de ${confirmation.quantite}L de carburant pour le véhicule ${confirmation.vehiculeImmatriculation}`,
          vehicle: confirmation.vehiculeImmatriculation,
          chauffeur: confirmation.chauffeurNom,
          quantite: confirmation.quantite,
          fuelCollectionId: confirmation.id,
          timestamp: new Date(confirmation.dateConfirmation)
        });
      });

      // Envoyer les notifications push
      notifications.forEach(notification => {
        this.sendPushNotification(notification);
        this.addToInternalNotifications(notification);
      });

      this.lastFuelCheck = new Date();
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des confirmations carburant:', error);
    }
  }

  // Envoyer une notification push (DÉSACTIVÉ - notifications uniquement dans la page)
  sendPushNotification(notification) {
    // Désactivé pour éviter les popups du navigateur
    // Les notifications s'affichent uniquement dans la page de notifications
    console.log('📢 Notification détectée:', notification.title);
    return;
  }

  // Ajouter une notification à la liste interne
  addToInternalNotifications(notification) {
    // Éviter les doublons
    let existingIndex = -1;
    
    if (notification.fuelCollectionId) {
      // Pour les notifications de carburant
      existingIndex = this.notifications.findIndex(n => 
        n.fuelCollectionId === notification.fuelCollectionId
      );
    } else {
      // Pour les notifications d'entretien
      existingIndex = this.notifications.findIndex(n => 
        n.vehicle === notification.vehicle && 
        n.maintenanceType === notification.maintenanceType &&
        n.type === notification.type
      );
    }

    if (existingIndex === -1) {
      // Ajouter un ID unique pour chaque notification
      notification.id = Date.now() + Math.random();
      notification.read = false;
      
      this.notifications.unshift(notification);
      
      // Garder seulement les 50 dernières notifications
      if (this.notifications.length > 50) {
        this.notifications = this.notifications.slice(0, 50);
      }
    }
  }

  // Obtenir toutes les notifications internes
  getNotifications() {
    return this.notifications;
  }

  // Marquer une notification comme lue
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  // Supprimer une notification
  removeNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
  }

  // Supprimer toutes les notifications
  clearAllNotifications() {
    this.notifications = [];
  }

  // Obtenir le nombre de notifications non lues
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // Obtenir le label d'un type d'entretien
  getTypeLabel(type) {
    switch (type) {
      case 'vidange': return 'Vidange';
      case 'categorie_b': return 'Catégorie B';
      case 'categorie_c': return 'Catégorie C';
      default: return type;
    }
  }

  // Vérifier manuellement les notifications (pour les tests)
  async manualCheck() {
    console.log('🔍 Vérification manuelle des notifications...');
    await this.checkMaintenanceNotifications();
    await this.checkFuelCollectionNotifications();
  }

  // Obtenir le statut du service
  getStatus() {
    return {
      isSupported: this.isSupported,
      permission: this.permission,
      isChecking: this.checkInterval !== null,
      lastCheck: this.lastCheck,
      lastFuelCheck: this.lastFuelCheck,
      notificationCount: this.notifications.length,
      unreadCount: this.getUnreadCount()
    };
  }
}

// Instance singleton
const notificationService = new NotificationService();

export default notificationService; 