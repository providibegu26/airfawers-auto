const prisma = require('../config/prisma');
const { notifyBreakdownReported } = require('../services/notificationEmitter');

const TYPES_PANNE = ['moteur', 'pneu', 'batterie', 'electrique', 'freinage', 'autre'];
const NIVEAUX_GRAVITE = ['utilisable', 'limite', 'immobilise'];
const STATUTS_ACTIFS = ['en_attente', 'en_cours'];
const STATUTS_PANNE = [...STATUTS_ACTIFS, 'resolue'];

const panneInclude = {
  vehicule: {
    select: {
      id: true,
      immatriculation: true,
      marque: true,
      modele: true,
      statut: true,
      kilometrage: true,
      categorie: true
    }
  },
  chauffeur: {
    select: {
      id: true,
      nom: true,
      postnom: true,
      prenom: true,
      telephone: true
    }
  }
};

function formatPanne(panne) {
  return {
    id: panne.id,
    type: panne.type,
    description: panne.description,
    niveauGravite: panne.niveauGravite,
    latitude: panne.latitude,
    longitude: panne.longitude,
    localisation: panne.localisation,
    statut: panne.statut,
    notesAdmin: panne.notesAdmin,
    dateSignalement: panne.dateSignalement,
    dateResolution: panne.dateResolution,
    vehicule: panne.vehicule,
    chauffeur: panne.chauffeur
      ? {
          id: panne.chauffeur.id,
          nom: panne.chauffeur.nom,
          postnom: panne.chauffeur.postnom,
          prenom: panne.chauffeur.prenom,
          telephone: panne.chauffeur.telephone,
          nomComplet: `${panne.chauffeur.prenom} ${panne.chauffeur.nom}`.trim()
        }
      : null
  };
}

async function syncVehiculeStatut(vehiculeId) {
  const vehicule = await prisma.vehicule.findUnique({ where: { id: vehiculeId } });
  if (!vehicule) return;

  const activeCount = await prisma.panne.count({
    where: {
      vehiculeId,
      statut: { in: STATUTS_ACTIFS }
    }
  });

  if (activeCount > 0) {
    await prisma.vehicule.update({
      where: { id: vehiculeId },
      data: { statut: 'en_panne' }
    });
    return;
  }

  const newStatut = vehicule.chauffeurId ? 'attribué' : 'disponible';
  await prisma.vehicule.update({
    where: { id: vehiculeId },
    data: { statut: newStatut }
  });
}

async function getAssignedVehicle(chauffeurId) {
  return prisma.vehicule.findFirst({
    where: { chauffeurId }
  });
}

// POST /api/chauffeur/pannes — Signaler une panne
async function createPanne(req, res) {
  try {
    const chauffeurId = req.user.chauffeurId;
    if (!chauffeurId) {
      return res.status(400).json({ success: false, message: 'Chauffeur non identifié' });
    }

    const { type, description, niveauGravite, latitude, longitude, localisation } = req.body;

    if (!type || !TYPES_PANNE.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Type de panne invalide. Valeurs acceptées : ${TYPES_PANNE.join(', ')}`
      });
    }

    if (!description || !String(description).trim()) {
      return res.status(400).json({
        success: false,
        message: 'La description de ce qui se passe est requise'
      });
    }

    if (!niveauGravite || !NIVEAUX_GRAVITE.includes(niveauGravite)) {
      return res.status(400).json({
        success: false,
        message: `Niveau de gravité invalide. Valeurs acceptées : ${NIVEAUX_GRAVITE.join(', ')}`
      });
    }

    const vehicule = await getAssignedVehicle(chauffeurId);
    if (!vehicule) {
      return res.status(400).json({
        success: false,
        message: 'Aucun véhicule ne vous est actuellement attribué'
      });
    }

    const panne = await prisma.panne.create({
      data: {
        vehiculeId: vehicule.id,
        chauffeurId,
        type,
        description: String(description).trim(),
        niveauGravite,
        latitude: latitude != null ? Number(latitude) : null,
        longitude: longitude != null ? Number(longitude) : null,
        localisation: localisation ? String(localisation).trim() : null,
        statut: 'en_attente'
      },
      include: panneInclude
    });

    await syncVehiculeStatut(vehicule.id);

    const updatedVehicule = await prisma.vehicule.findUnique({
      where: { id: vehicule.id },
      select: { id: true, statut: true, immatriculation: true }
    });

    console.log(`🚨 Panne signalée: véhicule ${vehicule.immatriculation} par chauffeur #${chauffeurId}`);

    await notifyBreakdownReported(panne, vehicule, panne.chauffeur);

    return res.status(201).json({
      success: true,
      message: 'Panne signalée avec succès',
      panne: formatPanne(panne),
      vehiculeStatut: updatedVehicule?.statut
    });
  } catch (error) {
    console.error('Erreur création panne:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

// GET /api/chauffeur/pannes — Historique du chauffeur connecté
async function getChauffeurPannes(req, res) {
  try {
    const chauffeurId = req.user.chauffeurId;
    if (!chauffeurId) {
      return res.status(400).json({ success: false, message: 'Chauffeur non identifié' });
    }

    const pannes = await prisma.panne.findMany({
      where: { chauffeurId },
      include: panneInclude,
      orderBy: { dateSignalement: 'desc' }
    });

    return res.json({
      success: true,
      pannes: pannes.map(formatPanne)
    });
  } catch (error) {
    console.error('Erreur récupération pannes chauffeur:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

// GET /api/admin/pannes — Liste toutes les pannes (historique inclus)
async function getAllPannes(req, res) {
  try {
    const { statut } = req.query;
    const where = {};

    if (statut) {
      if (!STATUTS_PANNE.includes(statut)) {
        return res.status(400).json({ error: `Statut invalide. Valeurs : ${STATUTS_PANNE.join(', ')}` });
      }
      where.statut = statut;
    }

    const pannes = await prisma.panne.findMany({
      where,
      include: panneInclude,
      orderBy: { dateSignalement: 'desc' }
    });

    return res.json({
      success: true,
      pannes: pannes.map(formatPanne)
    });
  } catch (error) {
    console.error('Erreur récupération pannes admin:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// GET /api/admin/pannes/stats — Compteurs pour le dashboard
async function getPanneStats(req, res) {
  try {
    const [total, enAttente, enCours, resolues, actives] = await Promise.all([
      prisma.panne.count(),
      prisma.panne.count({ where: { statut: 'en_attente' } }),
      prisma.panne.count({ where: { statut: 'en_cours' } }),
      prisma.panne.count({ where: { statut: 'resolue' } }),
      prisma.panne.count({ where: { statut: { in: STATUTS_ACTIFS } } })
    ]);

    return res.json({
      success: true,
      stats: {
        total,
        enAttente,
        enCours,
        resolues,
        actives
      }
    });
  } catch (error) {
    console.error('Erreur stats pannes:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// GET /api/admin/pannes/map — Pannes actives avec coordonnées pour la carte
async function getPannesMap(req, res) {
  try {
    const pannes = await prisma.panne.findMany({
      where: {
        statut: { in: STATUTS_ACTIFS },
        latitude: { not: null },
        longitude: { not: null }
      },
      include: panneInclude,
      orderBy: { dateSignalement: 'desc' }
    });

    return res.json({
      success: true,
      pannes: pannes.map((panne) => ({
        id: panne.id,
        type: panne.type,
        niveauGravite: panne.niveauGravite,
        statut: panne.statut,
        description: panne.description,
        latitude: panne.latitude,
        longitude: panne.longitude,
        localisation: panne.localisation,
        dateSignalement: panne.dateSignalement,
        vehicule: panne.vehicule,
        chauffeur: panne.chauffeur
          ? {
              id: panne.chauffeur.id,
              nomComplet: `${panne.chauffeur.prenom} ${panne.chauffeur.nom}`.trim(),
              telephone: panne.chauffeur.telephone
            }
          : null
      }))
    });
  } catch (error) {
    console.error('Erreur carte pannes:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// GET /api/admin/pannes/:id — Détail d'une panne
async function getPanneById(req, res) {
  try {
    const id = Number(req.params.id);
    const panne = await prisma.panne.findUnique({
      where: { id },
      include: panneInclude
    });

    if (!panne) {
      return res.status(404).json({ error: 'Panne non trouvée' });
    }

    return res.json({ success: true, panne: formatPanne(panne) });
  } catch (error) {
    console.error('Erreur détail panne:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// PATCH /api/admin/pannes/:id — Mettre à jour le statut (conserve l'historique)
async function updatePanneStatut(req, res) {
  try {
    const id = Number(req.params.id);
    const { statut, notesAdmin } = req.body;

    if (!statut || !STATUTS_PANNE.includes(statut)) {
      return res.status(400).json({
        error: `Statut invalide. Valeurs acceptées : ${STATUTS_PANNE.join(', ')}`
      });
    }

    const existing = await prisma.panne.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Panne non trouvée' });
    }

    const updateData = {
      statut,
      notesAdmin: notesAdmin != null ? String(notesAdmin).trim() : existing.notesAdmin
    };

    if (statut === 'resolue') {
      updateData.dateResolution = new Date();
    } else {
      updateData.dateResolution = null;
    }

    const panne = await prisma.panne.update({
      where: { id },
      data: updateData,
      include: panneInclude
    });

    await syncVehiculeStatut(panne.vehiculeId);

    const updatedVehicule = await prisma.vehicule.findUnique({
      where: { id: panne.vehiculeId },
      select: { id: true, statut: true, immatriculation: true }
    });

    return res.json({
      success: true,
      message: statut === 'resolue' ? 'Panne marquée comme résolue' : 'Statut mis à jour',
      panne: formatPanne(panne),
      vehiculeStatut: updatedVehicule?.statut
    });
  } catch (error) {
    console.error('Erreur mise à jour panne:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// GET /api/pannes/meta — Types et niveaux (public, pour les formulaires)
async function getPanneMeta(req, res) {
  return res.json({
    success: true,
    types: TYPES_PANNE,
    niveauxGravite: NIVEAUX_GRAVITE,
    statuts: STATUTS_PANNE,
    labels: {
      types: {
        moteur: 'Panne moteur',
        pneu: 'Pneu / roue',
        batterie: 'Batterie',
        electrique: 'Problème électrique',
        freinage: 'Freinage',
        autre: 'Autre'
      },
      niveauxGravite: {
        utilisable: 'Véhicule encore utilisable',
        limite: 'Utilisation limitée',
        immobilise: 'Véhicule immobilisé'
      },
      statuts: {
        en_attente: 'En attente',
        en_cours: 'En cours de traitement',
        resolue: 'Résolue'
      }
    }
  });
}

module.exports = {
  createPanne,
  getChauffeurPannes,
  getAllPannes,
  getPanneStats,
  getPannesMap,
  getPanneById,
  updatePanneStatut,
  getPanneMeta,
  TYPES_PANNE,
  NIVEAUX_GRAVITE,
  STATUTS_PANNE
};
