const express = require('express');
const router = express.Router();
const { 
  createVehicule, 
  getAllVehicules, 
  updateVehicule, 
  deleteVehicule, 
  updateMileage,
  assignDriver
} = require('../controllers/vehiculeController');

// Routes CRUD pour les véhicules
router.post('/', createVehicule);
router.get('/', getAllVehicules);
router.put('/:id', updateVehicule);
router.delete('/:id', deleteVehicule);

// Route pour assigner un chauffeur à un véhicule
router.put('/:id/assign-driver', assignDriver);

// Route pour mettre à jour le kilométrage d'un véhicule
router.put('/:immatriculation/mileage', updateMileage);

module.exports = router; 