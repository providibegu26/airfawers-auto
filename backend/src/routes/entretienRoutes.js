const express = require('express');
const router = express.Router();
const {
  validateMaintenance,
  getMaintenanceHistory,
  getAllMaintenanceHistory,
  deleteMaintenance,
  clearAllMaintenance
} = require('../controllers/entretienController');

// Valider un entretien
router.post('/validate', validateMaintenance);

// Récupérer l'historique d'un véhicule
router.get('/history/:vehiculeId', getMaintenanceHistory);

// Récupérer tout l'historique
router.get('/history', getAllMaintenanceHistory);

// Supprimer un entretien spécifique
router.delete('/:id', deleteMaintenance);

// Vider tout l'historique
router.delete('/clear/all', clearAllMaintenance);

module.exports = router; 