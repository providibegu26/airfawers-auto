const express = require('express');
const router = express.Router();
const { createChauffeur, getAllChauffeurs, updateChauffeur, deleteChauffeur } = require('../controllers/adminController');

// Routes pour les chauffeurs
router.post('/chauffeurs', createChauffeur);
router.get('/chauffeurs', getAllChauffeurs);
router.put('/chauffeurs/:id', updateChauffeur);
router.delete('/chauffeurs/:id', deleteChauffeur);

module.exports = router; 