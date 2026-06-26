const express = require('express');
const {
  getFenetre,
  ouvrirFenetre,
  fermerFenetre,
  getChauffeurStatut,
  submitChauffeurMileage,
} = require('../controllers/mileageController');
const { authenticateToken, requireChauffeur } = require('../middleware/auth');

const adminRouter = express.Router();
adminRouter.get('/fenetre', getFenetre);
adminRouter.post('/fenetre/ouvrir', ouvrirFenetre);
adminRouter.post('/fenetre/fermer', fermerFenetre);

const chauffeurRouter = express.Router();
chauffeurRouter.get('/statut', authenticateToken, requireChauffeur, getChauffeurStatut);
chauffeurRouter.put('/', authenticateToken, requireChauffeur, submitChauffeurMileage);

module.exports = { adminMileageRoutes: adminRouter, chauffeurMileageRoutes: chauffeurRouter };
