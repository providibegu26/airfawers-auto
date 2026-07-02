import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaGasPump, FaTools, FaExclamationTriangle } from "react-icons/fa";
import NotificationsPage from "../../components/notifications/NotificationsPage";
import chauffeurNotificationService from "../../services/chauffeurNotificationService";

const NotificationsChauffeur = () => {
  const [notifications, setNotifications] = useState([]);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const syncState = () => {
    setNotifications(chauffeurNotificationService.getNotifications());
    setServiceStatus(chauffeurNotificationService.getStatus());
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
        { label: "Véhicule", value: serviceStatus.vehicle || "—", tone: "slate" },
      ]
    : [];

  return (
    <NotificationsPage
      title="Mes alertes"
      subtitle="Entretiens et carburant de votre véhicule"
      notifications={notifications}
      serviceStatus={serviceStatus}
      isInitializing={isInitializing}
      unreadCount={unreadCount}
      statusItems={statusItems}
      isFuelNotification={(n) => Boolean(n.fuelAttributionId)}
      getMaintenanceLabel={(type) =>
        chauffeurNotificationService.getTypeLabel(type)
      }
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
      renderExtraMeta={(notification, getMaintenanceLabel) => (
        <>
          {notification.fuelAttributionId ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                <FaGasPump className="h-3 w-3" />
                {notification.quantity} L
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                <FaCheckCircle className="h-3 w-3" />
                Carburant attribué
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

export default NotificationsChauffeur;
