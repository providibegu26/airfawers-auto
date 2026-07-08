const prisma = require('../config/prisma');
const {
  getNextMaintenanceToPlan,
  validatePlanningDate,
  startOfDay,
  MAINTENANCE_LABELS,
  daysBetween,
} = require('../services/maintenancePlanningService');
const { notifyMaintenancePlanned } = require('../services/notificationEmitter');

async function getVehicleWithEstimations(vehiculeId) {
  const vehicule = await prisma.vehicule.findUnique({
    where: { id: parseInt(vehiculeId, 10) },
    include: {
      chauffeur: {
        include: {
          user: { select: { email: true } },
        },
      },
      historiqueEntretiens: { orderBy: { dateEffectuee: 'desc' } },
    },
  });

  if (!vehicule) return null;

  let finalCategory = vehicule.categorie || 'LIGHT';
  if (!['HEAVY', 'LIGHT'].includes(finalCategory)) {
    finalCategory = 'LIGHT';
  }

  const thresholds = {
    HEAVY: { vidange: 8000, categorie_b: 16000, categorie_c: 24000 },
    LIGHT: { vidange: 5000, categorie_b: 10000, categorie_c: 15000 },
  };

  const typeMapping = {
    vidange: 'vidange',
    categorie_b: 'bougies',
    categorie_c: 'freins',
  };

  const currentKm = vehicule.kilometrage || 0;
  const weeklyKm = vehicule.weeklyKm || 500;
  const estimations = {};

  ['vidange', 'categorie_b', 'categorie_c'].forEach((type) => {
    const threshold = thresholds[finalCategory][type];
    const oldType = typeMapping[type];
    const dernierEntretien = vehicule.historiqueEntretiens
      .filter((e) => e.type.toLowerCase() === oldType.toLowerCase())
      .sort((a, b) => new Date(b.dateEffectuee) - new Date(a.dateEffectuee))[0];

    let prochainSeuil;
    if (dernierEntretien) {
      const baseKm = dernierEntretien.kilometrage;
      const kmDepuis = currentKm - baseKm;
      const seuilsPasses = Math.floor(kmDepuis / threshold);
      prochainSeuil = baseKm + (seuilsPasses + 1) * threshold;
    } else {
      prochainSeuil = threshold;
    }

    if (currentKm >= prochainSeuil) {
      const seuilsPasses = Math.floor(currentKm / threshold);
      prochainSeuil = (seuilsPasses + 1) * threshold;
    }

    const kmRestants = prochainSeuil - currentKm;
    let semainesRestantes = Math.ceil(kmRestants / weeklyKm);
    if (kmRestants <= 0) semainesRestantes = 0;
    const joursRestants = semainesRestantes * 7;

    estimations[`${type}NextThreshold`] = prochainSeuil;
    estimations[`${type}KmRemaining`] = kmRestants;
    estimations[`${type}WeeksRemaining`] = semainesRestantes;
    estimations[`${type}DaysRemaining`] = joursRestants;
  });

  return { ...vehicule, ...estimations };
}

async function listPlannedMaintenances(req, res) {
  try {
    const { statut = 'planifie' } = req.query;

    const where = statut === 'all' ? {} : { statut };

    const planifies = await prisma.entretienPlanifie.findMany({
      where,
      include: {
        vehicule: {
          include: {
            chauffeur: true,
          },
        },
      },
      orderBy: { datePrevue: 'asc' },
    });

    res.json({ planifies });
  } catch (error) {
    console.error('Erreur liste planifications:', error);
    res.status(500).json({ error: error.message });
  }
}

async function planMaintenance(req, res) {
  try {
    const { vehiculeId, type, datePrevue, notes, items } = req.body;

    const entries = items?.length
      ? items
      : vehiculeId && type && datePrevue
        ? [{ vehiculeId, type }]
        : [];

    if (!entries.length || !datePrevue) {
      return res.status(400).json({
        error: 'datePrevue et au moins un entretien (vehiculeId + type) sont requis',
      });
    }

    const chosenDate = startOfDay(datePrevue);
    const activePlans = await prisma.entretienPlanifie.findMany({
      where: { statut: 'planifie' },
    });

    const created = [];
    const errors = [];

    for (const entry of entries) {
      const vehicle = await getVehicleWithEstimations(entry.vehiculeId);
      if (!vehicle) {
        errors.push({ vehiculeId: entry.vehiculeId, error: 'Véhicule non trouvé' });
        continue;
      }

      const nextToPlan = getNextMaintenanceToPlan(vehicle, activePlans);
      if (!nextToPlan) {
        errors.push({
          vehiculeId: entry.vehiculeId,
          error: 'Aucun entretien à planifier pour ce véhicule (déjà planifié ou hors fenêtre)',
        });
        continue;
      }

      if (entry.type && entry.type !== nextToPlan.type) {
        errors.push({
          vehiculeId: entry.vehiculeId,
          immatriculation: vehicle.immatriculation,
          error: `Seul l'entretien ${nextToPlan.typeLabel} peut être planifié pour ce véhicule`,
        });
        continue;
      }

      const dateCheck = validatePlanningDate(chosenDate, nextToPlan.daysRemaining);
      if (!dateCheck.valid) {
        errors.push({
          vehiculeId: entry.vehiculeId,
          immatriculation: vehicle.immatriculation,
          error: dateCheck.error,
        });
        continue;
      }

      try {
        const planif = await prisma.entretienPlanifie.create({
          data: {
            vehiculeId: vehicle.id,
            type: nextToPlan.type,
            datePrevue: chosenDate,
            seuilKm: nextToPlan.nextThreshold,
            notes: notes || null,
            statut: 'planifie',
          },
          include: {
            vehicule: {
              include: {
                chauffeur: {
                  include: { user: { select: { email: true } } },
                },
              },
            },
          },
        });

        activePlans.push(planif);
        created.push(planif);

        await notifyMaintenancePlanned(planif.vehicule, nextToPlan.type, chosenDate);
      } catch (dbError) {
        if (dbError.code === 'P2002') {
          errors.push({
            vehiculeId: entry.vehiculeId,
            immatriculation: vehicle.immatriculation,
            error: 'Cet entretien est déjà planifié pour ce cycle',
          });
        } else {
          throw dbError;
        }
      }
    }

    if (!created.length && errors.length) {
      return res.status(400).json({ error: 'Aucune planification créée', errors });
    }

    res.status(201).json({
      message: `${created.length} entretien(s) planifié(s)`,
      planifies: created,
      errors: errors.length ? errors : undefined,
    });
  } catch (error) {
    console.error('Erreur planification entretien:', error);
    res.status(500).json({ error: error.message });
  }
}

async function cancelPlannedMaintenance(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.entretienPlanifie.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Planification non trouvée' });
    }

    const updated = await prisma.entretienPlanifie.update({
      where: { id: existing.id },
      data: { statut: 'annule' },
    });

    res.json({ message: 'Planification annulée', planifie: updated });
  } catch (error) {
    console.error('Erreur annulation planification:', error);
    res.status(500).json({ error: error.message });
  }
}

async function listChauffeurPlannedMaintenances(req, res) {
  try {
    const chauffeurId = req.user.chauffeurId;
    if (!chauffeurId) {
      return res.status(400).json({ error: 'Chauffeur non identifié' });
    }

    const vehicule = await prisma.vehicule.findFirst({
      where: { chauffeurId },
    });

    if (!vehicule) {
      return res.json({ planifies: [] });
    }

    const planifies = await prisma.entretienPlanifie.findMany({
      where: {
        vehiculeId: vehicule.id,
        statut: 'planifie',
      },
      orderBy: { datePrevue: 'asc' },
    });

    const enriched = planifies.map((p) => ({
      ...p,
      typeLabel: MAINTENANCE_LABELS[p.type] || p.type,
    }));

    res.json({ planifies: enriched });
  } catch (error) {
    console.error('Erreur planifications chauffeur:', error);
    res.status(500).json({ error: error.message });
  }
}

async function getSchedulingCandidates(req, res) {
  try {
    const { date } = req.query;
    const selectedDate = date ? startOfDay(date) : null;

    const [vehicules, activePlans] = await Promise.all([
      prisma.vehicule.findMany({
        include: {
          chauffeur: true,
          historiqueEntretiens: { orderBy: { dateEffectuee: 'desc' } },
        },
      }),
      prisma.entretienPlanifie.findMany({ where: { statut: 'planifie' } }),
    ]);

    const vehiclesWithEstimations = await Promise.all(
      vehicules.map((v) => getVehicleWithEstimations(v.id))
    );

    const toSchedule = [];
    const suggestions = [];
    const others = [];

    for (const vehicle of vehiclesWithEstimations) {
      const next = getNextMaintenanceToPlan(vehicle, activePlans);
      if (!next) continue;

      const item = {
        vehiculeId: vehicle.id,
        immatriculation: vehicle.immatriculation,
        marque: vehicle.marque,
        modele: vehicle.modele,
        chauffeur: vehicle.chauffeur
          ? `${vehicle.chauffeur.nom} ${vehicle.chauffeur.prenom}`
          : null,
        type: next.type,
        typeLabel: next.typeLabel,
        daysRemaining: next.daysRemaining,
        estimatedDate: next.estimatedDate,
        nextThreshold: next.nextThreshold,
      };

      toSchedule.push(item);

      if (selectedDate) {
        const diff = Math.abs(daysBetween(selectedDate, next.estimatedDate));
        if (diff <= 5) {
          suggestions.push(item);
        } else {
          others.push(item);
        }
      }
    }

    res.json({
      toSchedule,
      suggestions: selectedDate ? suggestions : toSchedule,
      others: selectedDate ? others : [],
    });
  } catch (error) {
    console.error('Erreur candidats planification:', error);
    res.status(500).json({ error: error.message });
  }
}

async function markPlannedAsRealised(vehiculeId, type) {
  const active = await prisma.entretienPlanifie.findMany({
    where: {
      vehiculeId: parseInt(vehiculeId, 10),
      type,
      statut: 'planifie',
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!active.length) return;

  await prisma.entretienPlanifie.update({
    where: { id: active[0].id },
    data: { statut: 'realise' },
  });
}

module.exports = {
  listPlannedMaintenances,
  planMaintenance,
  cancelPlannedMaintenance,
  listChauffeurPlannedMaintenances,
  getSchedulingCandidates,
  markPlannedAsRealised,
};
