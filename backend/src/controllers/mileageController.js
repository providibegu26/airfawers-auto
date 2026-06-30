const mileageService = require('../services/mileageService');
const prisma = require('../config/prisma');
const {
  notifyMileageWindowOpened,
  notifyMileageUpdated,
} = require('../services/notificationEmitter');

async function getFenetre(req, res) {
  try {
    const status = await mileageService.getFenetreStatus();
    res.json(status);
  } catch (error) {
    console.error('Erreur statut fenêtre kilométrage:', error);
    res.status(500).json({ error: error.message });
  }
}

async function ouvrirFenetre(req, res) {
  try {
    const result = await mileageService.openFenetre();

    const chauffeursAvecVehicule = await prisma.chauffeur.findMany({
      where: { vehicules: { some: {} } },
      select: { id: true },
    });

    await Promise.all(
      chauffeursAvecVehicule.map((c) =>
        notifyMileageWindowOpened(c.id, result.fenetre?.semaine)
      )
    );

    res.json({
      message: 'Autorisation de saisie kilométrage activée pour la semaine en cours',
      ...result,
    });
  } catch (error) {
    console.error('Erreur ouverture fenêtre:', error);
    res.status(500).json({ error: error.message });
  }
}

async function fermerFenetre(req, res) {
  try {
    const result = await mileageService.closeFenetre();
    res.json({
      message: 'Autorisation de saisie kilométrage fermée',
      ...result,
    });
  } catch (error) {
    console.error('Erreur fermeture fenêtre:', error);
    res.status(500).json({ error: error.message });
  }
}

async function getChauffeurStatut(req, res) {
  try {
    const chauffeurId = req.user.chauffeurId;
    if (!chauffeurId) {
      return res.status(403).json({ error: 'Profil chauffeur requis' });
    }
    const status = await mileageService.getChauffeurMileageStatus(chauffeurId);
    res.json({ success: true, ...status });
  } catch (error) {
    console.error('Erreur statut chauffeur kilométrage:', error);
    res.status(500).json({ error: error.message });
  }
}

async function submitChauffeurMileage(req, res) {
  try {
    const chauffeurId = req.user.chauffeurId;
    if (!chauffeurId) {
      return res.status(403).json({ error: 'Profil chauffeur requis' });
    }

    const { newMileage } = req.body;
    const status = await mileageService.getChauffeurMileageStatus(chauffeurId);

    if (!status.vehicule) {
      return res.status(404).json({ error: 'Aucun véhicule attribué' });
    }

    const result = await mileageService.updateMileageCore({
      vehiculeId: status.vehicule.id,
      newMileage,
      source: 'chauffeur',
      chauffeurId,
    });

    const chauffeur = await prisma.chauffeur.findUnique({
      where: { id: chauffeurId },
      select: { id: true, nom: true, prenom: true },
    });

    await notifyMileageUpdated(status.vehicule, chauffeur, Number(newMileage));

    res.json({
      success: true,
      message: 'Kilométrage enregistré avec succès',
      ...result,
    });
  } catch (error) {
    const status = error.status || 500;
    if (status >= 500) console.error('Erreur saisie chauffeur:', error);
    res.status(status).json({ error: error.message });
  }
}

module.exports = {
  getFenetre,
  ouvrirFenetre,
  fermerFenetre,
  getChauffeurStatut,
  submitChauffeurMileage,
};
