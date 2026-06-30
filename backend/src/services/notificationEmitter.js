const prisma = require('../config/prisma');

const MAINTENANCE_LABELS = {
  vidange: 'Catégorie A',
  categorie_b: 'Catégorie B',
  categorie_c: 'Catégorie C',
};

async function createNotification({
  destinataireRole,
  destinataireUserId = null,
  chauffeurId = null,
  type,
  titre,
  message,
  payload = null,
}) {
  return prisma.notification.create({
    data: {
      destinataireRole,
      destinataireUserId,
      chauffeurId,
      type,
      titre,
      message,
      payload,
    },
  });
}

async function notifyChauffeurById(chauffeurId, { type, titre, message, payload }) {
  if (!chauffeurId) return null;

  const chauffeur = await prisma.chauffeur.findUnique({
    where: { id: chauffeurId },
    select: { userId: true },
  });

  if (!chauffeur) return null;

  return createNotification({
    destinataireRole: 'chauffeur',
    destinataireUserId: chauffeur.userId,
    chauffeurId,
    type,
    titre,
    message,
    payload,
  });
}

async function notifyAdmin({ type, titre, message, payload }) {
  return createNotification({
    destinataireRole: 'admin',
    type,
    titre,
    message,
    payload,
  });
}

async function notifyVehicleAssigned(vehicule, chauffeurId) {
  if (!chauffeurId || !vehicule) return null;

  return notifyChauffeurById(chauffeurId, {
    type: 'VEHICLE_ASSIGNED',
    titre: 'Véhicule attribué',
    message: `Le véhicule ${vehicule.immatriculation} (${vehicule.marque} ${vehicule.modele}) vous a été attribué.`,
    payload: {
      vehiculeId: vehicule.id,
      immatriculation: vehicule.immatriculation,
    },
  });
}

async function notifyFuelAssigned(vehicule, chauffeur, attribution) {
  if (!chauffeur) return null;

  return notifyChauffeurById(chauffeur.id, {
    type: 'FUEL_ASSIGNED',
    titre: 'Carburant attribué',
    message: `${attribution.quantite} L de carburant ont été attribués pour votre véhicule ${vehicule.immatriculation}.`,
    payload: {
      vehiculeId: vehicule.id,
      immatriculation: vehicule.immatriculation,
      fuelAttributionId: attribution.id,
      quantity: attribution.quantite,
    },
  });
}

async function notifyMaintenanceRecorded(vehicule, type) {
  if (!vehicule?.chauffeurId) return null;

  const label = MAINTENANCE_LABELS[type] || type;

  return notifyChauffeurById(vehicule.chauffeurId, {
    type: 'MAINTENANCE_SCHEDULED',
    titre: 'Entretien enregistré',
    message: `L'entretien ${label} de votre véhicule ${vehicule.immatriculation} a été enregistré par l'administrateur.`,
    payload: {
      vehiculeId: vehicule.id,
      immatriculation: vehicule.immatriculation,
      maintenanceType: type,
    },
  });
}

async function notifyBreakdownReported(panne, vehicule, chauffeur) {
  const nom = chauffeur
    ? `${chauffeur.prenom} ${chauffeur.nom}`.trim()
    : 'Un chauffeur';

  return notifyAdmin({
    type: 'BREAKDOWN_REPORTED',
    titre: 'Panne signalée',
    message: `${nom} a signalé une panne (${panne.type}) sur le véhicule ${vehicule.immatriculation}.`,
    payload: {
      panneId: panne.id,
      vehiculeId: vehicule.id,
      immatriculation: vehicule.immatriculation,
      niveauGravite: panne.niveauGravite,
      chauffeurNom: nom,
    },
  });
}

async function notifyFuelCollected(confirmation, vehicule, chauffeur) {
  const nom = `${chauffeur.prenom} ${chauffeur.nom}`.trim();

  return notifyAdmin({
    type: 'FUEL_COLLECTED',
    titre: 'Carburant récupéré',
    message: `${nom} a confirmé la récupération de ${confirmation.quantite} L pour ${vehicule.immatriculation}.`,
    payload: {
      confirmationId: confirmation.id,
      vehiculeId: vehicule.id,
      immatriculation: vehicule.immatriculation,
      chauffeurNom: nom,
      quantite: confirmation.quantite,
    },
  });
}

async function notifyMileageWindowOpened(chauffeurId, semaine) {
  return notifyChauffeurById(chauffeurId, {
    type: 'MILEAGE_WINDOW_OPEN',
    titre: 'Saisie kilométrage ouverte',
    message: `Mettez à jour le kilométrage de votre véhicule pour la semaine ${semaine}.`,
    payload: { semaine },
  });
}

async function notifyMileageUpdated(vehicule, chauffeur, newMileage) {
  const nom = chauffeur
    ? `${chauffeur.prenom} ${chauffeur.nom}`.trim()
    : 'Un chauffeur';

  return notifyAdmin({
    type: 'MILEAGE_UPDATED',
    titre: 'Kilométrage mis à jour',
    message: `${nom} a mis à jour le kilométrage de ${vehicule.immatriculation} : ${newMileage.toLocaleString('fr-FR')} km.`,
    payload: {
      vehiculeId: vehicule.id,
      immatriculation: vehicule.immatriculation,
      chauffeurNom: nom,
      kilometrage: newMileage,
    },
  });
}

module.exports = {
  createNotification,
  notifyChauffeurById,
  notifyAdmin,
  notifyVehicleAssigned,
  notifyFuelAssigned,
  notifyMaintenanceRecorded,
  notifyBreakdownReported,
  notifyFuelCollected,
  notifyMileageWindowOpened,
  notifyMileageUpdated,
};
