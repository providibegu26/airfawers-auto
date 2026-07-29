import { apiPath } from "./api";

export function getAdminToken() {
  return localStorage.getItem("adminToken");
}

/**
 * Headers Authorization pour les appels API admin.
 * @param {Record<string, string>} [extra]
 */
export function getAdminAuthHeaders(extra = {}) {
  const token = getAdminToken();
  const headers = { ...extra };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/**
 * fetch wrapper pour les routes admin — ajoute systématiquement Bearer adminToken.
 * @param {string} segment ex. "/admin/vehicules" ou "admin/chauffeurs"
 * @param {RequestInit} [options]
 */
export async function adminFetch(segment, options = {}) {
  const { headers: optionHeaders, body, ...rest } = options;
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const headers = {
    ...getAdminAuthHeaders(),
    ...(optionHeaders || {}),
  };

  if (body != null && !isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(apiPath(segment), {
    ...rest,
    headers,
    body,
  });
}
