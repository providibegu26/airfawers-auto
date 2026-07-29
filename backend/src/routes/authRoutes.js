const express = require('express');
const router = express.Router();
const { 
  loginChauffeur, 
  createChauffeurAccount, 
  getChauffeurProfile,
  personalizeChauffeurPassword,
} = require('../controllers/authController');
const { authenticateToken, requireChauffeur, requireAdmin } = require('../middleware/auth');
const { listChauffeurPlannedMaintenances } = require('../controllers/planningController');

// Route de connexion chauffeur
router.post('/chauffeur/login', loginChauffeur);

// Création compte chauffeur — admin uniquement
router.post(
  '/chauffeur/create',
  authenticateToken,
  requireAdmin,
  createChauffeurAccount
);

// Route pour récupérer le profil du chauffeur connecté (protégée)
router.get('/chauffeur/profile', authenticateToken, requireChauffeur, getChauffeurProfile);

router.get(
  '/chauffeur/entretiens/planifies',
  authenticateToken,
  requireChauffeur,
  listChauffeurPlannedMaintenances
);

// Personnalisation du mot de passe après première connexion
router.post(
  '/chauffeur/personalize-password',
  authenticateToken,
  requireChauffeur,
  personalizeChauffeurPassword
);

module.exports = router;
