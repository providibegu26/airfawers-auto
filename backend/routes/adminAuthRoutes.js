const express = require('express');
const router = express.Router();
const {
  login,
  verify,
  changePassword,
  updateProfile,
  logout,
} = require('../controllers/adminAuthController');
const { authenticateToken, requireAdmin } = require('../src/middleware/auth');

// Public — login uniquement
router.post('/login', login);

// Protégées — JWT admin requis
router.get('/verify', authenticateToken, requireAdmin, verify);
router.post('/change-password', authenticateToken, requireAdmin, changePassword);
router.put('/profile', authenticateToken, requireAdmin, updateProfile);
router.post('/logout', authenticateToken, requireAdmin, logout);

module.exports = router;
