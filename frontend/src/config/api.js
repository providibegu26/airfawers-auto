/**
 * URL de base de l'API backend.
 * - Dev : http://localhost:4000 (défaut)
 * - Prod (Vercel) : définir VITE_API_URL=https://xxx.up.railway.app (sans slash final)
 */
function stripTrailingSlash(url) {
  return url?.replace(/\/$/, "") ?? "";
}

function getApiOrigin() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl !== undefined && String(envUrl).trim() !== "") {
    return stripTrailingSlash(envUrl);
  }
  return "http://localhost:4000";
}

export const API_ORIGIN = getApiOrigin();

/**
 * Construit une URL API complète.
 * @param {string} segment ex. "/admin/vehicules" ou "/auth/chauffeur/login"
 */
export function apiPath(segment) {
  const seg = segment.startsWith("/") ? segment : `/${segment}`;
  const path = seg.startsWith("/api") ? seg : `/api${seg}`;
  return `${API_ORIGIN}${path}`;
}
