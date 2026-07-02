import {
  FaBell,
  FaCar,
  FaCheckCircle,
  FaCircle,
  FaCog,
  FaExclamationTriangle,
  FaGasPump,
  FaSync,
  FaTools,
  FaTrash,
} from "react-icons/fa";

const TYPE_STYLES = {
  urgent: {
    icon: FaExclamationTriangle,
    iconWrap: "bg-red-100 text-red-600",
    unread: "border-l-4 border-red-500 bg-red-50/80",
  },
  warning: {
    icon: FaTools,
    iconWrap: "bg-amber-100 text-amber-600",
    unread: "border-l-4 border-amber-500 bg-amber-50/80",
  },
  info: {
    icon: FaCar,
    iconWrap: "bg-blue-100 text-blue-600",
    unread: "border-l-4 border-blue-500 bg-blue-50/80",
  },
  fuel: {
    icon: FaGasPump,
    iconWrap: "bg-emerald-100 text-emerald-600",
    unread: "border-l-4 border-emerald-500 bg-emerald-50/80",
  },
  default: {
    icon: FaBell,
    iconWrap: "bg-slate-100 text-slate-600",
    unread: "border-l-4 border-slate-400 bg-slate-50/80",
  },
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
  if (diffDays < 7) return `Il y a ${diffDays} jour(s)`;
  return time.toLocaleDateString("fr-FR");
}

function getNotificationStyle(notification, isFuel) {
  if (isFuel) return TYPE_STYLES.fuel;
  return TYPE_STYLES[notification.type] || TYPE_STYLES.default;
}

function StatusPill({ label, value, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    indigo: "bg-indigo-100 text-indigo-700",
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3 backdrop-blur-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-sm font-semibold ${tones[tone] || tones.slate} inline-flex rounded-lg px-2 py-0.5`}>
        {value}
      </p>
    </div>
  );
}

export default function NotificationsPage({
  title = "Notifications",
  subtitle,
  notifications = [],
  serviceStatus,
  isInitializing = false,
  unreadCount = 0,
  onRefresh,
  onClearAll,
  onMarkAsRead,
  onRemove,
  getMaintenanceLabel,
  isFuelNotification,
  renderExtraMeta,
  statusItems = [],
}) {
  if (isInitializing) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <FaCog className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-600">Chargement des notifications…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 px-1 sm:px-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            <FaSync className="h-3.5 w-3.5" />
            Actualiser
          </button>
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <FaTrash className="h-3.5 w-3.5" />
              Tout effacer
            </button>
          )}
        </div>
      </div>

      {serviceStatus && statusItems.length > 0 && (
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-slate-50 p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {statusItems.map((item) => (
              <StatusPill
                key={item.label}
                label={item.label}
                value={item.value}
                tone={item.tone}
              />
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <FaBell className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-700">
              Aucune notification
            </p>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Les alertes d&apos;entretien et de carburant apparaîtront ici
              automatiquement.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((notification) => {
              const isFuel = isFuelNotification(notification);
              const style = getNotificationStyle(notification, isFuel);
              const Icon = style.icon;
              const isUnread = !notification.read;

              return (
                <li
                  key={notification.id}
                  className={`p-4 transition sm:p-5 ${
                    isUnread ? style.unread : "bg-white hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.iconWrap}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`text-base font-semibold ${
                                isUnread ? "text-slate-900" : "text-slate-600"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {isUnread && (
                              <FaCircle className="h-2 w-2 text-red-500" />
                            )}
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600">
                            {notification.message}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {notification.vehicle && (
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                <FaCar className="h-3 w-3" />
                                {notification.vehicle}
                              </span>
                            )}
                            {renderExtraMeta?.(notification, getMaintenanceLabel)}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-row items-center justify-between gap-3 sm:flex-col sm:items-end lg:min-w-[140px]">
                          <span className="text-xs text-slate-400">
                            {formatNotificationTimestamp(notification.timestamp)}
                          </span>
                          <div className="flex items-center gap-2">
                            {isUnread && (
                              <button
                                type="button"
                                onClick={() => onMarkAsRead(notification.id)}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
                              >
                                <FaCheckCircle className="h-3 w-3" />
                                Lu
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onRemove(notification.id)}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                              title="Supprimer"
                            >
                              <FaTrash className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
