import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "./notificationsApi";

class ChauffeurNotificationService {
  constructor() {
    this.notifications = [];
    this.isSupported = "Notification" in window;
    this.permission = this.isSupported ? Notification.permission : "denied";
    this.checkInterval = null;
    this.lastCheck = null;
    this.chauffeurVehicle = null;
  }

  async initialize() {
    if (this.isSupported && this.permission === "default") {
      this.permission = await Notification.requestPermission();
    }

    await this.syncFromApi();
    this.startPeriodicCheck();
    return this.permission === "granted";
  }

  startPeriodicCheck() {
    if (this.checkInterval) clearInterval(this.checkInterval);
    this.checkInterval = setInterval(() => this.syncFromApi(), 30000);
  }

  stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  async syncFromApi() {
    const token = localStorage.getItem("chauffeurToken");
    if (!token) {
      this.notifications = [];
      return;
    }

    try {
      const previousUnread = this.getUnreadCount();
      const incoming = await fetchNotifications("chauffeur");
      this.notifications = incoming;
      this.lastCheck = new Date();

      const newUnread = incoming.filter((n) => !n.read);
      if (this.permission === "granted" && newUnread.length > previousUnread) {
        const latest = newUnread[0];
        if (latest) {
          new Notification(latest.title, {
            body: latest.message,
            icon: "/favicon.ico",
            tag: `notification-${latest.id}`,
          });
        }
      }
    } catch (error) {
      console.error("Erreur synchronisation notifications chauffeur:", error);
    }
  }

  async manualCheck() {
    await this.syncFromApi();
  }

  getNotifications() {
    return [...this.notifications];
  }

  async markAsRead(notificationId) {
    await markNotificationRead("chauffeur", notificationId);
    const notification = this.notifications.find((n) => n.id === notificationId);
    if (notification) notification.read = true;
  }

  removeNotification(notificationId) {
    this.notifications = this.notifications.filter((n) => n.id !== notificationId);
  }

  async clearAllNotifications() {
    await markAllNotificationsRead("chauffeur");
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
  }

  getUnreadCount() {
    return this.notifications.filter((n) => !n.read).length;
  }

  async refreshUnreadCount() {
    try {
      return await fetchUnreadCount("chauffeur");
    } catch {
      return this.getUnreadCount();
    }
  }

  getTypeLabel(type) {
    switch (type) {
      case "vidange":
        return "Catégorie A";
      case "categorie_b":
        return "Catégorie B";
      case "categorie_c":
        return "Catégorie C";
      default:
        return type;
    }
  }

  getStatus() {
    return {
      permission: this.permission,
      notificationCount: this.notifications.length,
      unreadCount: this.getUnreadCount(),
      lastCheck: this.lastCheck,
      vehicle: this.chauffeurVehicle
        ? this.chauffeurVehicle.immatriculation
        : "Aucun véhicule",
    };
  }
}

const chauffeurNotificationService = new ChauffeurNotificationService();

export default chauffeurNotificationService;
