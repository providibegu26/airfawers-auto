import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaGasPump, FaTools, FaExclamationTriangle } from "react-icons/fa";
import NotificationsPage, {
  formatNotificationTimestamp,
} from "../components/notifications/NotificationsPage";
import notificationService from "../services/notificationService";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const syncState = () => {
    setNotifications(notificationService.getNotifications());
    setServiceStatus(notificationService.getStatus());
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

  const statusItems = serviceStatus
    ? [
        {
          label: "Statut",
          value:
            serviceStatus.permission === "granted" ? "Activé" : "Désactivé",
          tone: serviceStatus.permission === "granted" ? "green" : "red",
        },
        { label: "Total", value: serviceStatus.notificationCount, tone: "indigo" },
        { label: "Non lues", value: serviceStatus.unreadCount, tone: "slate" },
        {
          label: "Dernière vérif.",
          value: serviceStatus.lastCheck
            ? formatNotificationTimestamp(serviceStatus.lastCheck)
            : "Jamais",
          tone: "slate",
        },
      ]
    : [];

  return (
    <NotificationsPage
      title="Centre de notifications"
      subtitle="Alertes entretien et carburant de la flotte"
      notifications={notifications}
      serviceStatus={serviceStatus}
      isInitializing={isInitializing}
      unreadCount={unreadCount}
      statusItems={statusItems}
      isFuelNotification={(n) => Boolean(n.fuelCollectionId)}
      getMaintenanceLabel={(type) => notificationService.getTypeLabel(type)}
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
      renderExtraMeta={(notification, getMaintenanceLabel) => (
        <>
          {notification.fuelCollectionId ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                <FaGasPump className="h-3 w-3" />
                {notification.quantite} L
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                <FaCheckCircle className="h-3 w-3" />
                {notification.chauffeur}
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                <FaTools className="h-3 w-3" />
                {getMaintenanceLabel(notification.maintenanceType)}
              </span>
              {notification.daysRemaining && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                  <FaExclamationTriangle className="h-3 w-3" />
                  {notification.daysRemaining} jour(s)
                </span>
              )}
            </>
          )}
        </>
      )}
    />
  );
};

export default Notifications;
