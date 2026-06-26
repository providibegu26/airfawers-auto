import { apiPath } from "@/config/api";

// Service de notifications pour les chauffeurs
class ChauffeurNotificationService {
  constructor() {
    this.notifications = [];
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.checkInterval = null;
    this.lastCheck = new Date();
    this.chauffeurVehicle = null;
    this.lastFuelCheck = new Date();
    this.lastFuelAttributionId = null;
  }

  // Initialiser le service de notifications
  async initialize() {
    if (!this.isSupported) {
      console.log(' Notifications non supportées par ce navigateur');
      return false;
    }

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    if (this.permission === 'granted') {
      console.log('Notifications push activées pour chauffeur');
      this.startPeriodicCheck();
      return true;
    } else {
      console.log(' Permissions de notifications refusées');
      return false;
    }
  }

  // Démarrer la vérification périodique des entretiens et du carburant
  startPeriodicCheck() {
    // Vérifier toutes les 5 minutes
    this.checkInterval = setInterval(() => {
      this.checkMaintenanceNotifications();
      this.checkFuelNotifications();
      this.checkMileageWindowNotifications();
    }, 5 * 60 * 1000);

    // Vérifier immédiatement au démarrage
    this.checkMaintenanceNotifications();
    this.checkFuelNotifications();
    this.checkMileageWindowNotifications();
  }

  // Arrêter la vérification périodique
  stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Récupérer le véhicule du chauffeur connecté
  async fetchChauffeurVehicle() {
    try {
      const token = localStorage.getItem('chauffeurToken');
      if (!token) {
        console.log(' Token chauffeur manquant');
        return null;
      }

      const response = await fetch(apiPath("/auth/chauffeur/profile"), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success && data.chauffeur && data.chauffeur.vehicule) {
        this.chauffeurVehicle = data.chauffeur.vehicule;
        console.log(' Véhicule chauffeur récupéré:', this.chauffeurVehicle.immatriculation);
        return this.chauffeurVehicle;
      } else {
        console.log(' Aucun véhicule attribué au chauffeur');
        return null;
      }
    } catch (error) {
      console.error(' Erreur récupération véhicule chauffeur:', error);
      return null;
    }
  }

  // Vérifier les notifications d'entretien pour le véhicule du chauffeur
  async checkMaintenanceNotifications() {
    try {
      const vehicle = await this.fetchChauffeurVehicle();
      
      if (!vehicle) {
        console.log(' Pas de véhicule pour les notifications');
        return;
      }

      const notifications = [];
      
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
              message: `Il reste 14 jours pour l'entretien ${this.getTypeLabel(type)} de votre véhicule`,
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
              message: `Il ne reste que ${daysRemaining} jour(s) pour l'entretien ${this.getTypeLabel(type)} de votre véhicule`,
              vehicle: vehicle.immatriculation,
              maintenanceType: type,
              daysRemaining: daysRemaining,
              timestamp: new Date()
            });
          }

          // Notification en retard
          if (daysRemaining < 0) {
            notifications.push({
              type: 'urgent',
              title: `Entretien ${this.getTypeLabel(type)} en retard !`,
              message: `Votre véhicule est en retard de ${Math.abs(daysRemaining)} jour(s) pour l'entretien ${this.getTypeLabel(type)}`,
              vehicle: vehicle.immatriculation,
              maintenanceType: type,
              daysRemaining: daysRemaining,
              timestamp: new Date()
            });
          }
        }
      });

      // Envoyer les notifications push
      notifications.forEach(notification => {
        this.sendPushNotification(notification);
        this.addToInternalNotifications(notification);
      });

      console.log(` ${notifications.length} notification(s) d'entretien vérifiée(s) pour le chauffeur`);
      
    } catch (error) {
      console.error(' Erreur vérification notifications chauffeur:', error);
    }
  }

  // Vérifier les notifications de carburant
  async checkFuelNotifications() {
    try {
      const vehicle = await this.fetchChauffeurVehicle();
      
      if (!vehicle) {
        console.log(' Pas de véhicule pour les notifications carburant');
        return;
      }

      const token = localStorage.getItem('chauffeurToken');
      if (!token) {
        console.log(' Token chauffeur manquant pour vérification carburant');
        return;
      }

      // Récupérer l'historique carburant du véhicule
      const response = await fetch(apiPath(`/admin/carburant/historique/vehicule/${vehicle.id}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        console.log(' Erreur lors de la récupération de l\'historique carburant');
        return;
      }

      const fuelData = await response.json();
      const fuelHistory = fuelData.attributions || [];

      if (fuelHistory.length === 0) {
        return;
      }

      // Trouver la dernière attribution
      const latestAttribution = fuelHistory[0]; // Trié par date décroissante
      
      // Vérifier si c'est une nouvelle attribution
      if (this.lastFuelAttributionId !== latestAttribution.id) {
        this.lastFuelAttributionId = latestAttribution.id;
        
        // Vérifier si l'attribution est récente (moins de 24h)
        const attributionDate = new Date(latestAttribution.date);
        const now = new Date();
        const hoursDiff = (now - attributionDate) / (1000 * 60 * 60);
        
        if (hoursDiff <= 24) {
          // Créer la notification
          const notification = {
            type: 'info',
            title: 'Nouvelle attribution de carburant !',
            message: `Vous avez reçu ${latestAttribution.quantite}L de carburant pour votre véhicule ${vehicle.immatriculation}`,
            vehicle: vehicle.immatriculation,
            fuelAttributionId: latestAttribution.id,
            quantity: latestAttribution.quantite,
            date: latestAttribution.date,
            timestamp: new Date()
          };

          // Envoyer la notification
          this.sendPushNotification(notification);
          this.addToInternalNotifications(notification);
          
          console.log(' Notification carburant envoyée:', notification.title);
        }
      }
      
    } catch (error) {
      console.error(' Erreur vérification notifications carburant:', error);
    }
  }

  // Envoyer une notification push
  sendPushNotification(notification) {
    if (this.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.fuelAttributionId ? 
          `fuel-${notification.vehicle}-${notification.fuelAttributionId}` : 
          `maintenance-${notification.vehicle}-${notification.maintenanceType}`,
        requireInteraction: notification.type === 'urgent'
      });
    }
  }

  // Ajouter à la liste interne des notifications
  addToInternalNotifications(notification) {
    // Éviter les doublons
    const existingIndex = this.notifications.findIndex(n => {
      if (notification.fuelAttributionId) {
        // Pour les notifications carburant
        return n.fuelAttributionId === notification.fuelAttributionId;
      } else {
        // Pour les notifications d'entretien
        return n.vehicle === notification.vehicle && 
               n.maintenanceType === notification.maintenanceType &&
               n.type === notification.type;
      }
    });

    if (existingIndex >= 0) {
      // Mettre à jour la notification existante
      this.notifications[existingIndex] = {
        ...notification,
        read: this.notifications[existingIndex].read
      };
    } else {
      // Ajouter une nouvelle notification
      this.notifications.unshift({
        ...notification,
        read: false
      });
    }

    // Limiter à 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
  }

  // Obtenir toutes les notifications
  getNotifications() {
    return [...this.notifications];
  }

  // Marquer comme lu
  markAsRead(notificationId) {
    if (this.notifications[notificationId]) {
      this.notifications[notificationId].read = true;
    }
  }

  // Supprimer une notification
  removeNotification(notificationId) {
    this.notifications.splice(notificationId, 1);
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
    switch(type) {
      case 'vidange': return 'Catégorie A';
      case 'categorie_b': return 'Catégorie B';
      case 'categorie_c': return 'Catégorie C';
      default: return type;
    }
  }

  // Notification quand l'admin ouvre la saisie kilométrage
  async checkMileageWindowNotifications() {
    try {
      const token = localStorage.getItem('chauffeurToken');
      if (!token) return;

      const response = await fetch(apiPath("/chauffeur/kilometrage/statut"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;

      const data = await response.json();
      if (!data.peutSaisir) return;

      const weekKey = data.semaine;
      const notifiedKey = `mileage_window_notified_${weekKey}`;
      if (localStorage.getItem(notifiedKey)) return;

      const notification = {
        id: `mileage-window-${weekKey}`,
        type: 'mileage',
        title: 'Saisie kilométrage ouverte',
        message: `Mettez à jour le kilométrage de votre véhicule (${data.vehicule?.immatriculation || ''}).`,
        timestamp: new Date().toISOString(),
        priority: 'high',
      };

      this.addOrUpdateNotification(notification);

      if (this.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id,
        });
      }

      localStorage.setItem(notifiedKey, new Date().toISOString());
    } catch (error) {
      console.error('Erreur notification kilométrage:', error);
    }
  }

  // Vérification manuelle
  async manualCheck() {
    console.log(' Vérification manuelle des notifications chauffeur...');
    await this.checkMaintenanceNotifications();
    await this.checkFuelNotifications();
    await this.checkMileageWindowNotifications();
    this.lastCheck = new Date();
  }

  // Obtenir le statut du service
  getStatus() {
    return {
      permission: this.permission,
      notificationCount: this.notifications.length,
      unreadCount: this.getUnreadCount(),
      lastCheck: this.lastCheck,
      lastFuelCheck: this.lastFuelCheck,
      vehicle: this.chauffeurVehicle ? this.chauffeurVehicle.immatriculation : 'Aucun véhicule'
    };
  }
}

const chauffeurNotificationService = new ChauffeurNotificationService();

export default chauffeurNotificationService;
