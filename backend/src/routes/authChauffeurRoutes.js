const express = require('express');
const { checkEmail, setPassword, loginChauffeur } = require('../controllers/authChauffeurController');
const router = express.Router();

router.post('/chauffeur/check-email', checkEmail);
router.post('/chauffeur/set-password', setPassword);
router.post('/chauffeur/login', loginChauffeur);

module.exports = router; 