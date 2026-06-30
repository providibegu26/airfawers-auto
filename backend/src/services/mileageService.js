const { PrismaClient } = require('@prisma/client');
const { getCurrentWeekKey } = require('../utils/weekKinshasa');
const { getPrixLitre } = require('../config/fuelPrices');

const prisma = new PrismaClient();

const COEFFICIENTS = { HEAVY: 0.2, LIGHT: 0.08 };

const getCoef = (categorie) =>
  COEFFICIENTS[(categorie || 'LIGHT').toUpperCase()] ?? COEFFICIENTS.LIGHT;

async function getOrCreateFenetre(semaine) {
  return prisma.fenetreMiseAJourKilometrage.upsert({
    where: { semaine },
    create: { semaine, ouverte: false },
    update: {},
  });
}

/**
 * Suivi des saisies pour une semaine donnée.
 * Si `ouverteLe` est fourni, on ne compte que les saisies effectuées
 * pendant l'autorisation en cours (depuis sa dernière ouverture) afin que
 * la progression se réinitialise à chaque nouvelle autorisation.
 */
async function getSuiviSemaine(semaine, ouverteLe = null) {
  const vehiculesAvecChauffeur = await prisma.vehicule.findMany({
    where: { chauffeurId: { not: null } },
    select: { id: true, immatriculation: true, chauffeurId: true },
  });

  const saisies = await prisma.saisieKilometrageChauffeur.findMany({
    where: {
      semaine,
      ...(ouverteLe ? { dateSaisie: { gte: ouverteLe } } : {}),
    },
    select: { vehiculeId: true },
  });
  const saisieSet = new Set(saisies.map((s) => s.vehiculeId));

  const total = vehiculesAvecChauffeur.length;
  const misAJour = vehiculesAvecChauffeur.filter((v) => saisieSet.has(v.id)).length;

  return {
    semaine,
    totalVehiculesAttribues: total,
    vehiculesMisAJourChauffeur: misAJour,
    tousMisAJour: total > 0 && misAJour >= total,
    vehicules: vehiculesAvecChauffeur.map((v) => ({
      ...v,
      saisieChauffeurEffectuee: saisieSet.has(v.id),
    })),
  };
}

async function getFenetreStatus() {
  const semaine = getCurrentWeekKey();
  const fenetre = await getOrCreateFenetre(semaine);
  const suivi = await getSuiviSemaine(semaine, fenetre.ouverteLe);
  return {
    semaine,
    ouverte: fenetre.ouverte,
    ouverteLe: fenetre.ouverteLe,
    fermeeLe: fenetre.fermeeLe,
    ...suivi,
  };
}

async function openFenetre() {
  const semaine = getCurrentWeekKey();
  const fenetre = await prisma.fenetreMiseAJourKilometrage.upsert({
    where: { semaine },
    create: {
      semaine,
      ouverte: true,
      ouverteLe: new Date(),
      fermeeLe: null,
    },
    update: {
      ouverte: true,
      ouverteLe: new Date(),
      fermeeLe: null,
    },
  });
  return { fenetre, ...(await getSuiviSemaine(semaine, fenetre.ouverteLe)) };
}

async function closeFenetre() {
  const semaine = getCurrentWeekKey();
  const fenetre = await prisma.fenetreMiseAJourKilometrage.update({
    where: { semaine },
    data: {
      ouverte: false,
      fermeeLe: new Date(),
    },
  });
  return { fenetre, ...(await getSuiviSemaine(semaine, fenetre.ouverteLe)) };
}

async function maybeAutoCloseFenetre(semaine) {
  const fenetre = await prisma.fenetreMiseAJourKilometrage.findUnique({
    where: { semaine },
  });
  if (!fenetre?.ouverte) return fenetre;

  const suivi = await getSuiviSemaine(semaine, fenetre.ouverteLe);
  if (suivi.tousMisAJour) {
    return prisma.fenetreMiseAJourKilometrage.update({
      where: { semaine },
      data: { ouverte: false, fermeeLe: new Date() },
    });
  }
  return fenetre;
}

async function upsertHistoriqueConsommation({
  vehiculeId,
  semaine,
  categorie,
  typeCarburant,
  kilometrageAvant,
  kilometrageApres,
  source,
}) {
  // Si une saisie existe déjà cette semaine, on conserve le kilométrage de
  // départ d'origine afin que le total reflète toute la distance parcourue
  // sur la semaine (et non uniquement le dernier delta).
  const existing = await prisma.historiqueConsommation.findUnique({
    where: { vehiculeId_semaine: { vehiculeId, semaine } },
  });

  const baseAvant = existing?.kilometrageAvant ?? kilometrageAvant;
  const kmParcourus = Math.max(0, kilometrageApres - baseAvant);
  const coef = getCoef(categorie);
  const consommation = kmParcourus * coef;
  const cout = Math.round(consommation * getPrixLitre(typeCarburant));

  return prisma.historiqueConsommation.upsert({
    where: {
      vehiculeId_semaine: { vehiculeId, semaine },
    },
    create: {
      vehiculeId,
      semaine,
      kmParcourus,
      consommation,
      cout,
      kilometrageAvant: baseAvant,
      kilometrageApres,
      source,
    },
    update: {
      kmParcourus,
      consommation,
      cout,
      kilometrageApres,
      source,
      date: new Date(),
    },
  });
}

/**
 * Mise à jour kilométrage — cœur métier.
 * @param {object} opts
 * @param {number} opts.vehiculeId
 * @param {number} opts.newMileage
 * @param {'admin'|'chauffeur'} opts.source
 * @param {number} [opts.chauffeurId] requis si source=chauffeur
 */
async function updateMileageCore({ vehiculeId, newMileage, source, chauffeurId }) {
  const semaine = getCurrentWeekKey();
  const vehicule = await prisma.vehicule.findUnique({
    where: { id: vehiculeId },
    include: {
      chauffeur: {
        select: { id: true, nom: true, prenom: true, telephone: true },
      },
    },
  });

  if (!vehicule) {
    const err = new Error('Véhicule non trouvé');
    err.status = 404;
    throw err;
  }

  const previousMileage = vehicule.kilometrage || 0;
  const parsedMileage = Number(newMileage);

  if (!Number.isFinite(parsedMileage) || parsedMileage <= 0) {
    const err = new Error('Kilométrage invalide');
    err.status = 400;
    throw err;
  }

  if (parsedMileage <= previousMileage) {
    const err = new Error(
      'Le nouveau kilométrage doit être supérieur au kilométrage actuel'
    );
    err.status = 400;
    throw err;
  }

  const weeklyKm = parsedMileage - previousMileage;

  if (source === 'chauffeur') {
    const fenetre = await getOrCreateFenetre(semaine);
    if (!fenetre.ouverte) {
      const err = new Error(
        "La saisie kilométrage n'est pas ouverte pour cette semaine"
      );
      err.status = 403;
      throw err;
    }

    if (!vehicule.chauffeurId || vehicule.chauffeurId !== chauffeurId) {
      const err = new Error('Vous ne pouvez modifier que votre véhicule assigné');
      err.status = 403;
      throw err;
    }

    const existingSaisie = await prisma.saisieKilometrageChauffeur.findUnique({
      where: {
        vehiculeId_semaine: { vehiculeId, semaine },
      },
    });

    // On bloque uniquement si une saisie a déjà été faite pendant
    // l'autorisation EN COURS. Si l'admin a ré-autorisé depuis (nouvelle
    // ouverteLe), le chauffeur peut saisir à nouveau.
    const dejaSaisiCetteFenetre =
      existingSaisie &&
      fenetre.ouverteLe &&
      existingSaisie.dateSaisie >= fenetre.ouverteLe;

    if (dejaSaisiCetteFenetre) {
      const err = new Error('Kilométrage déjà saisi pour cette autorisation');
      err.status = 409;
      throw err;
    }
  }

  const updatedVehicule = await prisma.vehicule.update({
    where: { id: vehiculeId },
    data: {
      kilometrage: parsedMileage,
      weeklyKm,
    },
    include: {
      chauffeur: {
        select: { id: true, nom: true, prenom: true, telephone: true },
      },
    },
  });

  await upsertHistoriqueConsommation({
    vehiculeId,
    semaine,
    categorie: vehicule.categorie,
    typeCarburant: vehicule.typeCarburant,
    kilometrageAvant: previousMileage,
    kilometrageApres: parsedMileage,
    source,
  });

  if (source === 'chauffeur') {
    // Upsert : permet plusieurs saisies dans la même semaine (une par
    // autorisation) sans violer la contrainte unique [vehiculeId, semaine].
    await prisma.saisieKilometrageChauffeur.upsert({
      where: {
        vehiculeId_semaine: { vehiculeId, semaine },
      },
      create: {
        vehiculeId,
        chauffeurId,
        semaine,
        kilometrageAvant: previousMileage,
        kilometrageApres: parsedMileage,
        kmParcourus: weeklyKm,
        dateSaisie: new Date(),
      },
      update: {
        chauffeurId,
        kilometrageAvant: previousMileage,
        kilometrageApres: parsedMileage,
        kmParcourus: weeklyKm,
        dateSaisie: new Date(),
      },
    });
    await maybeAutoCloseFenetre(semaine);
  }

  return {
    vehicule: updatedVehicule,
    weeklyKm,
    semaine,
    kilometrageAvant: previousMileage,
  };
}

async function getChauffeurMileageStatus(chauffeurId) {
  const semaine = getCurrentWeekKey();
  const fenetre = await getOrCreateFenetre(semaine);

  const vehicule = await prisma.vehicule.findFirst({
    where: { chauffeurId },
  });

  if (!vehicule) {
    return {
      semaine,
      fenetreOuverte: fenetre.ouverte,
      ouverteLe: fenetre.ouverteLe,
      vehicule: null,
      dejaSaisi: false,
      peutSaisir: false,
      message: 'Aucun véhicule attribué',
    };
  }

  const saisie = await prisma.saisieKilometrageChauffeur.findUnique({
    where: {
      vehiculeId_semaine: { vehiculeId: vehicule.id, semaine },
    },
  });

  // "Déjà saisi" est relatif à l'autorisation en cours : si l'admin a
  // ré-ouvert la fenêtre après la dernière saisie, le chauffeur peut saisir.
  const dejaSaisi =
    !!saisie && !!fenetre.ouverteLe && saisie.dateSaisie >= fenetre.ouverteLe;
  const peutSaisir = fenetre.ouverte && !dejaSaisi;

  return {
    semaine,
    fenetreOuverte: fenetre.ouverte,
    ouverteLe: fenetre.ouverteLe,
    vehicule: {
      id: vehicule.id,
      immatriculation: vehicule.immatriculation,
      marque: vehicule.marque,
      modele: vehicule.modele,
      kilometrage: vehicule.kilometrage,
      categorie: vehicule.categorie,
    },
    dejaSaisi,
    peutSaisir,
    saisie: saisie
      ? {
          kmParcourus: saisie.kmParcourus,
          dateSaisie: saisie.dateSaisie,
        }
      : null,
  };
}

module.exports = {
  getFenetreStatus,
  getSuiviSemaine,
  openFenetre,
  closeFenetre,
  updateMileageCore,
  getChauffeurMileageStatus,
  getCurrentWeekKey,
};
