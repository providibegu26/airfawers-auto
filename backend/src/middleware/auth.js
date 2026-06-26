const jwt = require('jsonwebtoken');

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
  console.log('🔐 authenticateToken appelé');
  const authHeader = req.headers['authorization'];
  console.log('📋 Authorization header:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  console.log('🎫 Token extrait:', token ? 'Présent' : 'Absent');

  if (!token) {
    console.log('❌ Token manquant');
    return res.status(401).json({
      success: false,
      message: 'Token d\'accès requis'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      console.log('❌ Token invalide:', err.message);
      return res.status(403).json({
        success: false,
        message: 'Token invalide'
      });
    }
    console.log('✅ Token valide, user:', user);
    req.user = user;
    next();
  });
};

// Middleware pour vérifier que l'utilisateur est un chauffeur
const requireChauffeur = (req, res, next) => {
  if (req.user.role !== 'chauffeur') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux chauffeurs'
    });
  }
  next();
};

// Middleware pour vérifier que l'utilisateur est un admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux administrateurs'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireChauffeur,
  requireAdmin
};

