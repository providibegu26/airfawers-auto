const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET manquant');
  }
  return secret;
}

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token d'accès requis",
    });
  }

  try {
    const user = jwt.verify(token, getJwtSecret());
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Token invalide',
    });
  }
};

// Middleware pour vérifier que l'utilisateur est un chauffeur
const requireChauffeur = (req, res, next) => {
  if (req.user?.role !== 'chauffeur') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux chauffeurs',
    });
  }
  next();
};

// Middleware pour vérifier que l'utilisateur est un admin
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux administrateurs',
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireChauffeur,
  requireAdmin,
  getJwtSecret,
};
