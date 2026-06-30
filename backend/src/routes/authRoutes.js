const express = require('express');
const router = express.Router();
const { 
  loginAdmin, 
  loginChauffeur, 
  createChauffeurAccount, 
  getChauffeurProfile,
  personalizeChauffeurPassword,
} = require('../controllers/authController');
const { authenticateToken, requireChauffeur } = require('../middleware/auth');

// Route de connexion admin
router.post('/admin/login', loginAdmin);

// Route de connexion chauffeur
router.post('/chauffeur/login', loginChauffeur);

// Route pour créer un compte chauffeur (appelée depuis le modal d'ajout de chauffeur)
router.post('/chauffeur/create', createChauffeurAccount);

// Route pour récupérer le profil du chauffeur connecté (protégée)
router.get('/chauffeur/profile', authenticateToken, requireChauffeur, getChauffeurProfile);

// Personnalisation du mot de passe après première connexion
router.post(
  '/chauffeur/personalize-password',
  authenticateToken,
  requireChauffeur,
  personalizeChauffeurPassword
);

module.exports = router;

