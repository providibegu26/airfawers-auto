import React, { useState, useEffect } from "react";
import NotificationsPage from "../../components/notifications/NotificationsPage";
import chauffeurNotificationService from "../../services/chauffeurNotificationService";

function buildSubtitle(notification, getMaintenanceLabel) {
  const parts = [];

  if (notification.vehicle) parts.push(notification.vehicle);

  if (notification.fuelAttributionId) {
    if (notification.quantity) parts.push(`${notification.quantity} L`);
    parts.push("Carburant attribué");
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

const NotificationsChauffeur = () => {
  const [notifications, setNotifications] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);

  const syncState = () => {
    setNotifications(chauffeurNotificationService.getNotifications());
  };

  useEffect(() => {
    const init = async () => {
      setIsInitializing(true);
      try {
        await chauffeurNotificationService.initialize();
        syncState();
        await chauffeurNotificationService.manualCheck();
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
      backPath="/chauffeur"
      summarySubtitle="Entretiens et carburant de votre véhicule"
      notifications={notifications}
      isInitializing={isInitializing}
      unreadCount={unreadCount}
      isFuelNotification={(n) => Boolean(n.fuelAttributionId)}
      getMaintenanceLabel={(type) =>
        chauffeurNotificationService.getTypeLabel(type)
      }
      getNotificationSubtitle={buildSubtitle}
      onRefresh={async () => {
        await chauffeurNotificationService.manualCheck();
        syncState();
      }}
      onClearAll={async () => {
        await chauffeurNotificationService.clearAllNotifications();
        syncState();
      }}
      onMarkAsRead={async (id) => {
        await chauffeurNotificationService.markAsRead(id);
        syncState();
      }}
      onRemove={(id) => {
        chauffeurNotificationService.removeNotification(id);
        syncState();
      }}
    />
  );
};

export default NotificationsChauffeur;
