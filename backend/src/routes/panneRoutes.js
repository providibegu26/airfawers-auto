const express = require('express');
const {
  createPanne,
  getChauffeurPannes,
  getAllPannes,
  getPanneStats,
  getPannesMap,
  getPanneById,
  updatePanneStatut,
  getPanneMeta
} = require('../controllers/panneController');
const { authenticateToken, requireChauffeur } = require('../middleware/auth');

const chauffeurRouter = express.Router();
const adminRouter = express.Router();
const metaRouter = express.Router();

// Métadonnées (types, niveaux) — accessible sans auth
metaRouter.get('/meta', getPanneMeta);

// Routes chauffeur (protégées)
chauffeurRouter.post('/', authenticateToken, requireChauffeur, createPanne);
chauffeurRouter.get('/', authenticateToken, requireChauffeur, getChauffeurPannes);

// Routes admin
adminRouter.get('/stats', getPanneStats);
adminRouter.get('/map', getPannesMap);
adminRouter.get('/', getAllPannes);
adminRouter.get('/:id', getPanneById);
adminRouter.patch('/:id', updatePanneStatut);

module.exports = {
  chauffeurPanneRoutes: chauffeurRouter,
  adminPanneRoutes: adminRouter,
  panneMetaRoutes: metaRouter
};
