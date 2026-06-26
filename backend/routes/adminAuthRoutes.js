const express = require('express');
const router = express.Router();
const {
  login,
  verify,
  changePassword,
  updateProfile,
  logout,
  createAdmin,
  authenticateToken
} = require('../controllers/adminAuthController');

// Routes publiques (pas besoin d'authentification)
router.post('/login', login);
router.post('/create', createAdmin); // Pour l'initialisation

// Routes protégées (nécessitent un token valide)
router.get('/verify', authenticateToken, verify);
router.post('/change-password', authenticateToken, changePassword);
router.put('/profile', authenticateToken, updateProfile);
router.post('/logout', authenticateToken, logout);

module.exports = router; 