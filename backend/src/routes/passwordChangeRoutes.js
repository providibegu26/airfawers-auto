const express = require('express');
const { requestPasswordChange, confirmPasswordChange } = require('../controllers/passwordChangeController');

const router = express.Router();

// Demander un changement de mot de passe
router.post('/request', requestPasswordChange);

// Confirmer le changement de mot de passe
router.post('/confirm', confirmPasswordChange);

module.exports = router;



