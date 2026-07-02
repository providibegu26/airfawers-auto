function normalizeBaseUrl(url) {
  if (!url) return "";
  return String(url).trim().replace(/\/$/, "");
}

/**
 * URL de base du frontend (Vercel en prod, Vite en local).
 * FRONTEND_URL > premier host de CORS_ORIGIN > localhost:5173
 */
function getFrontendBaseUrl() {
  const explicit = normalizeBaseUrl(process.env.FRONTEND_URL);
  if (explicit) return explicit;

  const corsOrigin = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((s) => s.trim())
    .find(Boolean);
  if (corsOrigin) return normalizeBaseUrl(corsOrigin);

  if (process.env.NODE_ENV === "production") {
    return "https://airfawers-auto.vercel.app";
  }

  return "http://localhost:5173";
}

function getChauffeurLoginUrl() {
  return `${getFrontendBaseUrl()}/chauffeur/login`;
}

module.exports = {
  getFrontendBaseUrl,
  getChauffeurLoginUrl,
};
