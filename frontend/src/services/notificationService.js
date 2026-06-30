import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "./notificationsApi";

class NotificationService {
  constructor() {
    this.notifications = [];
    this.checkInterval = null;
    this.lastCheck = null;
  }

  async syncFromApi() {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      this.notifications = [];
      return;
    }

    try {
      this.notifications = await fetchNotifications("admin");
      this.lastCheck = new Date();
    } catch (error) {
      console.error("Erreur synchronisation notifications admin:", error);
    }
  }

  async initialize() {
    await this.syncFromApi();
    this.startPeriodicCheck();
    return true;
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

  async manualCheck() {
    await this.syncFromApi();
  }

  getNotifications() {
    return [...this.notifications];
  }

  async markAsRead(notificationId) {
    await markNotificationRead("admin", notificationId);
    const notification = this.notifications.find((n) => n.id === notificationId);
    if (notification) notification.read = true;
  }

  removeNotification(notificationId) {
    this.notifications = this.notifications.filter((n) => n.id !== notificationId);
  }

  async clearAllNotifications() {
    await markAllNotificationsRead("admin");
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
  }

  getUnreadCount() {
    return this.notifications.filter((n) => !n.read).length;
  }

  async refreshUnreadCount() {
    try {
      return await fetchUnreadCount("admin");
    } catch {
      return this.getUnreadCount();
    }
  }

  getTypeLabel(type) {
    switch (type) {
      case "vidange":
        return "Vidange";
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
      isChecking: this.checkInterval !== null,
      lastCheck: this.lastCheck,
      notificationCount: this.notifications.length,
      unreadCount: this.getUnreadCount(),
    };
  }
}

const notificationService = new NotificationService();

export default notificationService;
