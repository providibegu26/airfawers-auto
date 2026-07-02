import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaCar,
  FaCheckCircle,
  FaCog,
  FaExclamationTriangle,
  FaGasPump,
  FaSync,
  FaTools,
  FaTrash,
} from "react-icons/fa";
import {
  ProfileSettingsPage,
  ProfileSettingsHeader,
  ProfileSummaryCard,
  SettingsSectionLabel,
  SettingsGroup,
  SettingsRow,
  SettingsDivider,
} from "../profile/ProfileSettingsLayout";

const TYPE_STYLES = {
  urgent: { icon: FaExclamationTriangle, wrap: "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400" },
  warning: { icon: FaTools, wrap: "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400" },
  info: { icon: FaCar, wrap: "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400" },
  fuel: { icon: FaGasPump, wrap: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" },
  default: { icon: FaBell, wrap: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
};

export function formatNotificationTimestamp(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return time.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function getDateGroupLabel(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const notifDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today - notifDay) / 86400000);

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return "Cette semaine";
  return "Plus ancien";
}

function groupNotificationsByDate(notifications) {
  const groups = new Map();
  const order = ["Aujourd'hui", "Hier", "Cette semaine", "Plus ancien"];

  notifications.forEach((n) => {
    const label = getDateGroupLabel(n.timestamp);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(n);
  });

  return order
    .filter((label) => groups.has(label))
    .map((label) => ({ label, items: groups.get(label) }));
}

function getNotificationStyle(notification, isFuel) {
  if (isFuel) return TYPE_STYLES.fuel;
  return TYPE_STYLES[notification.type] || TYPE_STYLES.default;
}

function NotificationRow({
  notification,
  isFuel,
  subtitle,
  onMarkAsRead,
  onRemove,
}) {
  const style = getNotificationStyle(notification, isFuel);
  const Icon = style.icon;
  const isUnread = !notification.read;

  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.wrap}`}
      >
        <Icon className="h-4 w-4" />
      </span>

      <button
        type="button"
        onClick={() => isUnread && onMarkAsRead(notification.id)}
        className="min-w-0 flex-1 text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm font-medium leading-snug ${
              isUnread
                ? "text-slate-900 dark:text-white"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {notification.title}
            {isUnread && (
              <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-500 align-middle" />
            )}
          </p>
          <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500">
            {formatNotificationTimestamp(notification.timestamp)}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {subtitle || notification.message}
        </p>
      </button>

      <button
        type="button"
        onClick={() => onRemove(notification.id)}
        className="shrink-0 rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
        aria-label="Supprimer"
      >
        <FaTrash className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function NotificationsPage({
  title = "Notifications",
  backPath,
  notifications = [],
  isInitializing = false,
  unreadCount = 0,
  summarySubtitle,
  onRefresh,
  onClearAll,
  onMarkAsRead,
  onRemove,
  getMaintenanceLabel,
  isFuelNotification,
  getNotificationSubtitle,
}) {
  const navigate = useNavigate();
  const groups = groupNotificationsByDate(notifications);

  if (isInitializing) {
    return (
      <ProfileSettingsPage>
        <div className="flex min-h-[50vh] items-center justify-center">
          <FaCog className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      </ProfileSettingsPage>
    );
  }

  const summaryAvatar = (
    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
      <FaBell className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </div>
  );

  return (
    <ProfileSettingsPage>
      <ProfileSettingsHeader
        title={title}
        onBack={() => navigate(backPath ?? -1)}
      />

      <ProfileSummaryCard
        avatar={summaryAvatar}
        name={
          notifications.length === 0
            ? "Aucune alerte"
            : `${notifications.length} notification${notifications.length > 1 ? "s" : ""}`
        }
        subtitle={
          summarySubtitle ??
          (unreadCount > 0
            ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
            : "Tout est à jour")
        }
      />

      {notifications.length === 0 ? (
        <SettingsGroup>
          <div className="px-4 py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <FaBell className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Rien pour le moment
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Les alertes apparaîtront ici automatiquement.
            </p>
          </div>
        </SettingsGroup>
      ) : (
        <div className="space-y-5">
          {groups.map(({ label, items }) => (
            <div key={label}>
              <SettingsSectionLabel>{label}</SettingsSectionLabel>
              <SettingsGroup>
                {items.map((notification, index) => {
                  const isFuel = isFuelNotification(notification);
                  const subtitle =
                    getNotificationSubtitle?.(notification, getMaintenanceLabel) ||
                    notification.message;

                  return (
                    <div key={notification.id}>
                      {index > 0 && <SettingsDivider />}
                      <NotificationRow
                        notification={notification}
                        isFuel={isFuel}
                        subtitle={subtitle}
                        onMarkAsRead={onMarkAsRead}
                        onRemove={onRemove}
                      />
                    </div>
                  );
                })}
              </SettingsGroup>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 space-y-5">
        <SettingsSectionLabel>Actions</SettingsSectionLabel>
        <SettingsGroup>
          <SettingsRow
            icon={FaSync}
            label="Actualiser"
            onClick={onRefresh}
          />
          {notifications.length > 0 && (
            <>
              <SettingsDivider />
              <SettingsRow
                icon={FaTrash}
                label="Tout effacer"
                destructive
                onClick={onClearAll}
              />
            </>
          )}
        </SettingsGroup>
      </div>
    </ProfileSettingsPage>
  );
}
