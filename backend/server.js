// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const { configureCors } = require("./src/config/cors");
const { isEmailConfigured, verifyEmail, getEmailProvider, getEmailFrom } = require("./src/config/email");
const { assertJwtSecret } = require("./src/utils/jwtSecret");
const { authenticateToken, requireAdmin } = require("./src/middleware/auth");

dotenv.config();
assertJwtSecret();

const app = express();
const port = process.env.PORT || 4000;
const host = process.env.HOST || "0.0.0.0";

// Middleware
configureCors(app);
app.use(express.json());

// Santé (Railway / monitoring)
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "airfawers-auto-api" });
});

app.get("/api/health/email", async (req, res) => {
  const provider = getEmailProvider();
  if (!isEmailConfigured()) {
    return res.json({
      ok: false,
      configured: false,
      message:
        "Définissez BREVO_API_KEY + EMAIL_FROM (Railway) ou EMAIL_USER + EMAIL_PASS (local).",
    });
  }
  const check = await verifyEmail();
  res.json({
    ok: check.ok,
    configured: true,
    provider,
    from: getEmailFrom() || undefined,
    status: check.ok ? "connecté" : check.error,
  });
});

// Routes d'authentification admin (login public ; reste protégé dans le router)
const adminAuthRoutes = require('./routes/adminAuthRoutes');
app.use('/api/admin/auth', adminAuthRoutes);

// Routes d'authentification générales
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Authentification chauffeur (login / mot de passe)
const authChauffeurRoutes = require('./src/routes/authChauffeurRoutes');
app.use('/api/auth-chauffeur', authChauffeurRoutes);

// Routes admin métier — JWT + rôle admin obligatoire
const vehicleRoutes = require('./src/routes/vehiculeRoutes');
app.use('/api/admin/vehicules', authenticateToken, requireAdmin, vehicleRoutes);

const entretienRoutes = require('./src/routes/entretienRoutes');
app.use('/api/admin/entretiens', authenticateToken, requireAdmin, entretienRoutes);

const chauffeurRoutes = require('./routes/chauffeurRoutes');
app.use('/api/admin/chauffeurs', authenticateToken, requireAdmin, chauffeurRoutes);

const { adminCarburantRoutes, chauffeurCarburantRoutes } = require('./src/routes/carburantRoutes');
app.use('/api/admin/carburant', authenticateToken, requireAdmin, adminCarburantRoutes);
app.use('/api/chauffeur/carburant', chauffeurCarburantRoutes);

// Routes pour le changement de mot de passe
const passwordChangeRoutes = require('./src/routes/passwordChangeRoutes');
app.use('/api/auth/chauffeur/password-change', passwordChangeRoutes);

// Profil chauffeur (photo)
const chauffeurProfileRoutes = require('./src/routes/chauffeurProfileRoutes');
app.use('/api/chauffeur/profile', chauffeurProfileRoutes);

// Routes pour les pannes
const { chauffeurPanneRoutes, adminPanneRoutes, panneMetaRoutes } = require('./src/routes/panneRoutes');
app.use('/api/chauffeur/pannes', chauffeurPanneRoutes);
app.use('/api/admin/pannes', authenticateToken, requireAdmin, adminPanneRoutes);
app.use('/api/pannes', panneMetaRoutes);

// Routes kilométrage (fenêtre + saisie chauffeur)
const { adminMileageRoutes, chauffeurMileageRoutes } = require('./src/routes/mileageRoutes');
app.use('/api/admin/kilometrage', authenticateToken, requireAdmin, adminMileageRoutes);
app.use('/api/chauffeur/kilometrage', chauffeurMileageRoutes);

// Notifications persistées
const {
  chauffeurNotificationRoutes,
  adminNotificationRoutes,
} = require('./src/routes/notificationRoutes');
app.use('/api/chauffeur/notifications', chauffeurNotificationRoutes);
app.use('/api/admin/notifications', adminNotificationRoutes);

// Route test
app.get("/", (req, res) => {
  res.send("🚀 Backend en ligne !");
});

// Démarrage du serveur
app.listen(port, host, () => {
  console.log(`🟢 Serveur backend démarré sur http://${host}:${port}`);
});
