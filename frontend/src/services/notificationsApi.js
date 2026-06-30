import { apiPath } from "@/config/api";

function getAuthHeaders(role) {
  const tokenKey = role === "admin" ? "adminToken" : "chauffeurToken";
  const token = localStorage.getItem(tokenKey);
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

const basePath = (role) =>
  role === "admin"
    ? apiPath("/admin/notifications")
    : apiPath("/chauffeur/notifications");

export async function fetchNotifications(role) {
  const response = await fetch(basePath(role), {
    headers: getAuthHeaders(role),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Impossible de charger les notifications");
  }
  return data.notifications || [];
}

export async function fetchUnreadCount(role) {
  const response = await fetch(`${basePath(role)}/unread-count`, {
    headers: getAuthHeaders(role),
  });
  const data = await response.json();
  if (!response.ok) return 0;
  return data.unreadCount ?? 0;
}

export async function markNotificationRead(role, id) {
  const response = await fetch(`${basePath(role)}/${id}/read`, {
    method: "PATCH",
    headers: getAuthHeaders(role),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Erreur lors du marquage");
  }
  return data.notification;
}

export async function markAllNotificationsRead(role) {
  const response = await fetch(`${basePath(role)}/read-all`, {
    method: "PATCH",
    headers: getAuthHeaders(role),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Erreur lors du marquage");
  }
  return data;
}
