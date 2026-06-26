const express = require('express');
const router = express.Router();
const { createChauffeur, getAllChauffeurs, updateChauffeur, deleteChauffeur } = require('../src/controllers/chauffeurController');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.post('/create', createChauffeur);

// Route pour récupérer tous les chauffeurs
router.get('/', getAllChauffeurs);

// Route pour modifier un chauffeur
router.put('/:id', updateChauffeur);

// Récupérer un chauffeur par son email
router.get('/by-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const chauffeur = await prisma.chauffeur.findFirst({
      where: {
        user: {
          email: email
        }
      },
      include: {
        user: true,
        vehicules: true
      }
    });
    
    if (!chauffeur) {
      return res.status(404).json({ error: "Chauffeur non trouvé avec cet email" });
    }
    
    res.json(chauffeur);
  } catch (error) {
    console.error('Erreur récupération chauffeur par email:', error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupérer le prochain entretien du véhicule du chauffeur
router.get('/:id/entretiens/prochain', async (req, res) => {
  try {
    const { id } = req.params;
    // Trouver le véhicule principal du chauffeur
    const vehicule = await prisma.vehicule.findFirst({
      where: { chauffeurId: parseInt(id) },
    });
    if (!vehicule) {
      return res.status(404).json({ error: "Aucun véhicule trouvé pour ce chauffeur" });
    }
    // Chercher le prochain entretien (date future la plus proche)
    const prochainEntretien = await prisma.historiqueEntretien.findFirst({
      where: {
        vehiculeId: vehicule.id,
        dateEffectuee: { gte: new Date() }
      },
      orderBy: { dateEffectuee: 'asc' }
    });
    if (!prochainEntretien) {
      return res.status(404).json({ error: "Aucun entretien programmé pour ce véhicule" });
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
    // On suppose qu'un chauffeur n'a qu'un seul véhicule principal
    const vehicule = await prisma.vehicule.findFirst({
      where: { chauffeurId: parseInt(id) },
    });
    if (!vehicule) {
      return res.status(404).json({ error: "Aucun véhicule trouvé pour ce chauffeur" });
    }
    res.json(vehicule);
  } catch (error) {
    console.error('Erreur récupération véhicule du chauffeur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du véhicule du chauffeur' });
  }
});

// Récupérer tous les chauffeurs
router.get('/', async (req, res) => {
  try {
    const chauffeurs = await prisma.chauffeur.findMany({
      include: {
        user: true,
        vehicules: true
      }
    });

    res.json({
      success: true,
      chauffeurs: chauffeurs
    });
  } catch (error) {
    console.error('Erreur récupération chauffeurs:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des chauffeurs'
    });
  }
});

// Création de chauffeur gérée par le contrôleur chauffeurController

// Mettre à jour un chauffeur
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, postnom, prenom, sexe, telephone } = req.body;

    const chauffeur = await prisma.chauffeur.update({
      where: { id: parseInt(id) },
      data: {
        nom,
        postnom,
        prenom,
        sexe,
        telephone
      },
      include: {
        user: true,
        vehicules: true
      }
    });

    res.json({
      success: true,
      chauffeur: chauffeur
    });
  } catch (error) {
    console.error('Erreur mise à jour chauffeur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du chauffeur'
    });
  }
});

// Supprimer un chauffeur
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.chauffeur.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Chauffeur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression chauffeur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du chauffeur'
    });
  }
});

module.exports = router; 