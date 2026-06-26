// Configuration CORS et sécurité
const cors = require("cors");

function getAllowedOrigins() {
  if (process.env.CORS_ORIGIN) {
    return process.env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean);
  }
  return ["http://localhost:5173", "http://localhost:4173"];
}

function configureCors(app) {
  const allowedOrigins = getAllowedOrigins();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origine non autorisée par CORS: ${origin}`));
        }
      },
      credentials: true,
    })
  );
}

module.exports = { configureCors, getAllowedOrigins };
