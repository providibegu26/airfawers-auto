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
const { authenticateToken, requireChauffeur } = require('../middleware/auth');

const adminRouter = express.Router();
const chauffeurRouter = express.Router();

// --- Admin ---
adminRouter.get('/prix', getPrixCarburant);
adminRouter.get('/estimation/:vehiculeId', getEstimation);
adminRouter.post('/attribuer', attribuerCarburant);
adminRouter.get('/historique/vehicule/:vehiculeId', getHistoriqueVehicule);
adminRouter.get('/historique/global', getHistoriqueGlobal);
adminRouter.get('/rapports', getRapport);
adminRouter.get('/confirmations-recentes', getConfirmationsRecentes);
adminRouter.get('/confirmations/vehicule/:vehiculeId', getHistoriqueConfirmationsVehicule);

// --- Chauffeur (auth requise) ---
chauffeurRouter.get('/prix', authenticateToken, requireChauffeur, getPrixCarburant);
chauffeurRouter.get(
  '/historique/vehicule/:vehiculeId',
  authenticateToken,
  requireChauffeur,
  getHistoriqueVehicule
);
chauffeurRouter.post(
  '/confirmer-recuperation',
  authenticateToken,
  requireChauffeur,
  confirmerRecuperationCarburant
);
chauffeurRouter.get(
  '/confirmations/vehicule/:vehiculeId',
  authenticateToken,
  requireChauffeur,
  getHistoriqueConfirmationsVehicule
);

module.exports = {
  adminCarburantRoutes: adminRouter,
  chauffeurCarburantRoutes: chauffeurRouter,
  // Compat éventuelle
  default: adminRouter,
};
