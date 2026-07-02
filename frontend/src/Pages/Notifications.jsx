import React, { useState, useEffect } from "react";
import NotificationsPage from "../components/notifications/NotificationsPage";
import notificationService from "../services/notificationService";

function buildSubtitle(notification, getMaintenanceLabel) {
  const parts = [];

  if (notification.vehicle) parts.push(notification.vehicle);

  if (notification.fuelCollectionId) {
    if (notification.quantite) parts.push(`${notification.quantite} L`);
    if (notification.chauffeur) parts.push(notification.chauffeur);
  } else {
    if (notification.maintenanceType) {
      parts.push(getMaintenanceLabel(notification.maintenanceType));
    }
    if (notification.daysRemaining) {
      parts.push(`${notification.daysRemaining} jour(s) restant(s)`);
    }
  }

  const meta = parts.join(" · ");
  return meta ? `${notification.message} — ${meta}` : notification.message;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);

  const syncState = () => {
    setNotifications(notificationService.getNotifications());
  };

  useEffect(() => {
    const init = async () => {
      setIsInitializing(true);
      try {
        await notificationService.initialize();
        syncState();
        await notificationService.manualCheck();
        syncState();
      } catch (error) {
        console.error("Erreur initialisation notifications:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    init();
    const interval = setInterval(syncState, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsPage
      title="Notifications"
      backPath="/admin"
      summarySubtitle="Alertes entretien et carburant de la flotte"
      notifications={notifications}
      isInitializing={isInitializing}
      unreadCount={unreadCount}
      isFuelNotification={(n) => Boolean(n.fuelCollectionId)}
      getMaintenanceLabel={(type) => notificationService.getTypeLabel(type)}
      getNotificationSubtitle={buildSubtitle}
      onRefresh={async () => {
        await notificationService.manualCheck();
        syncState();
      }}
      onClearAll={async () => {
        await notificationService.clearAllNotifications();
        syncState();
      }}
      onMarkAsRead={async (id) => {
        await notificationService.markAsRead(id);
        syncState();
      }}
      onRemove={(id) => {
        notificationService.removeNotification(id);
        syncState();
      }}
    />
  );
};

export default Notifications;
