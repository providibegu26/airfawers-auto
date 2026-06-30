const express = require('express');
const {
	getEstimation,
	attribuerCarburant,
	getHistoriqueVehicule,
	getHistoriqueGlobal,
	getRapport,
	confirmerRecuperationCarburant,
	getConfirmationsRecentes,
	getHistoriqueConfirmationsVehicule,
	getPrixCarburant
} = require('../controllers/carburantController');

const router = express.Router();

// Prix carburant (Essence / Gasoil)
router.get('/prix', getPrixCarburant);

// Estimation pour un véhicule
router.get('/estimation/:vehiculeId', getEstimation);

// Créer une attribution
router.post('/attribuer', attribuerCarburant);

// Historique
router.get('/historique/vehicule/:vehiculeId', getHistoriqueVehicule);
router.get('/historique/global', getHistoriqueGlobal);

// Rapports simples
router.get('/rapports', getRapport);

// Nouvelles routes pour les confirmations de récupération
router.post('/confirmer-recuperation', confirmerRecuperationCarburant);
router.get('/confirmations-recentes', getConfirmationsRecentes);
router.get('/confirmations/vehicule/:vehiculeId', getHistoriqueConfirmationsVehicule);

module.exports = router;


