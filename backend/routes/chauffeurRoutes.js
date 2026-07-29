const express = require('express');
const router = express.Router();
const { createChauffeur, getAllChauffeurs, updateChauffeur, deleteChauffeur } = require('../src/controllers/chauffeurController');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const USER_SAFE_SELECT = {
  id: true,
  email: true,
  motDePasseDefini: true,
  doitChangerMotDePasse: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

router.post('/create', createChauffeur);
router.get('/', getAllChauffeurs);
router.put('/:id', updateChauffeur);
router.delete('/:id', deleteChauffeur);

// Récupérer un chauffeur par son email (sans hash mot de passe)
router.get('/by-email/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const chauffeur = await prisma.chauffeur.findFirst({
      where: {
        user: {
          email: { equals: email, mode: 'insensitive' },
        },
      },
      include: {
        user: { select: USER_SAFE_SELECT },
        vehicules: true,
      },
    });

    if (!chauffeur) {
      return res.status(404).json({ error: 'Chauffeur non trouvé avec cet email' });
    }

    res.json(chauffeur);
  } catch (error) {
    console.error('Erreur récupération chauffeur par email:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer le prochain entretien du véhicule du chauffeur
router.get('/:id/entretiens/prochain', async (req, res) => {
  try {
    const { id } = req.params;
    const vehicule = await prisma.vehicule.findFirst({
      where: { chauffeurId: parseInt(id) },
    });
    if (!vehicule) {
      return res.status(404).json({ error: 'Aucun véhicule trouvé pour ce chauffeur' });
    }
    const prochainEntretien = await prisma.historiqueEntretien.findFirst({
      where: {
        vehiculeId: vehicule.id,
        dateEffectuee: { gte: new Date() },
      },
      orderBy: { dateEffectuee: 'asc' },
    });
    if (!prochainEntretien) {
      return res.status(404).json({ error: 'Aucun entretien programmé pour ce véhicule' });
    }
    res.json(prochainEntretien);
  } catch (error) {
    console.error('Erreur récupération prochain entretien:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du prochain entretien' });
  }
});

// Récupérer le véhicule associé à un chauffeur
router.get('/:id/vehicule', async (req, res) => {
  try {
    const { id } = req.params;
    const vehicule = await prisma.vehicule.findFirst({
      where: { chauffeurId: parseInt(id) },
    });
    if (!vehicule) {
      return res.status(404).json({ error: 'Aucun véhicule trouvé pour ce chauffeur' });
    }
    res.json(vehicule);
  } catch (error) {
    console.error('Erreur récupération véhicule du chauffeur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du véhicule du chauffeur' });
  }
});

module.exports = router;
