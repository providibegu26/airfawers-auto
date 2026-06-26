const prisma = require('../config/prisma');

// Constantes de calcul
const PRIX_LITRE_FC = 2990; // FC par litre
const COEFFICIENTS_CATEGORIE = {
	HEAVY: 0.20, // 20 L / 100 km -> 0.20 L/km
	LIGHT: 0.08 // 8 L / 100 km -> 0.08 L/km
};

function getCoefficientCategorie(categorie) {
	const normalized = (categorie || 'LIGHT').toUpperCase();
	return COEFFICIENTS_CATEGORIE[normalized] ?? COEFFICIENTS_CATEGORIE.LIGHT;
}

// Estimation simple basée sur le weeklyKm du véhicule
async function getEstimation(req, res) {
	try {
		const { vehiculeId } = req.params;
		const vehicule = await prisma.vehicule.findUnique({ where: { id: Number(vehiculeId) } });
		if (!vehicule) return res.status(404).json({ error: 'Véhicule non trouvé' });

		const coef = getCoefficientCategorie(vehicule.categorie);
		const estimationLitres = (vehicule.weeklyKm || 0) * coef; // L
		const cout = Math.round(estimationLitres * PRIX_LITRE_FC);
		const marge = 0.10; // ±10%

		return res.json({
			vehiculeId: vehicule.id,
			weeklyKm: vehicule.weeklyKm,
			coefficient: coef,
			estimationLitres,
			cout,
			marge,
			plage: {
				min: estimationLitres * (1 - marge),
				max: estimationLitres * (1 + marge)
			}
		});
	} catch (error) {
		console.error('Erreur estimation carburant:', error);
		return res.status(500).json({ error: 'Erreur serveur' });
	}
}

// Créer une attribution de carburant
async function attribuerCarburant(req, res) {
	try {
		const { vehiculeId, quantite, estimation, marge, notes } = req.body;
		if (!vehiculeId || typeof quantite !== 'number') {
			return res.status(400).json({ error: 'vehiculeId et quantite sont requis' });
		}

		const vehicule = await prisma.vehicule.findUnique({ 
			where: { id: Number(vehiculeId) },
			include: {
				chauffeur: true
			}
		});
		if (!vehicule) return res.status(404).json({ error: 'Véhicule non trouvé' });

		const cout = Math.round(quantite * PRIX_LITRE_FC);

		const attribution = await prisma.attributionCarburant.create({
			data: {
				vehiculeId: Number(vehiculeId),
				quantite,
				estimation: typeof estimation === 'number' ? estimation : null,
				marge: typeof marge === 'number' ? marge : 0.10,
				cout,
				notes: notes || null
			}
		});

		// Log de l'attribution pour les notifications
		console.log(`🚗 Attribution carburant créée: ${quantite}L pour véhicule ${vehicule.immatriculation}`);
		if (vehicule.chauffeur) {
			console.log(`👤 Chauffeur notifié: ${vehicule.chauffeur.prenom} ${vehicule.chauffeur.nom}`);
		}

		return res.status(201).json({ 
			message: 'Attribution enregistrée', 
			attribution,
			vehicule: {
				immatriculation: vehicule.immatriculation,
				marque: vehicule.marque,
				modele: vehicule.modele
			},
			chauffeur: vehicule.chauffeur ? {
				id: vehicule.chauffeur.id,
				prenom: vehicule.chauffeur.prenom,
				nom: vehicule.chauffeur.nom
			} : null
		});
	} catch (error) {
		console.error('Erreur attribution carburant:', error);
		return res.status(500).json({ error: 'Erreur serveur' });
	}
}

// Historique par véhicule
async function getHistoriqueVehicule(req, res) {
	try {
		const { vehiculeId } = req.params;
		const attributions = await prisma.attributionCarburant.findMany({
			where: { vehiculeId: Number(vehiculeId) },
			orderBy: { date: 'desc' }
		});
		return res.json({ attributions });
	} catch (error) {
		console.error('Erreur historique véhicule:', error);
		return res.status(500).json({ error: 'Erreur serveur' });
	}
}

// Historique global
async function getHistoriqueGlobal(req, res) {
	try {
		const attributions = await prisma.attributionCarburant.findMany({ orderBy: { date: 'desc' } });
		return res.json({ attributions });
	} catch (error) {
		console.error('Erreur historique global:', error);
		return res.status(500).json({ error: 'Erreur serveur' });
	}
}

// Rapports simples (agrégation par période)
async function getRapport(req, res) {
	try {
		const { periode = 'weekly' } = req.query; // weekly | monthly
		// Pour un premier jet: regrouper par semaine ISO (YYYY-Www) ou mois (YYYY-MM)
		const attributions = await prisma.attributionCarburant.findMany();

		const groupKey = (date) => {
			const d = new Date(date);
			const y = d.getUTCFullYear();
			const m = `${d.getUTCMonth() + 1}`.padStart(2, '0');
			if (periode === 'monthly') return `${y}-${m}`;
			// Weekly (naïf): numéro de semaine approx basé sur jour de l'année
			const start = new Date(Date.UTC(y, 0, 1));
			const diff = Math.floor((d - start) / 86400000);
			const week = Math.floor(diff / 7) + 1;
			return `${y}-W${String(week).padStart(2, '0')}`;
		};

		const aggreg = {};
		for (const a of attributions) {
			const key = groupKey(a.date);
			if (!aggreg[key]) aggreg[key] = { litres: 0, cout: 0 };
			aggreg[key].litres += a.quantite;
			aggreg[key].cout += a.cout;
		}

		return res.json({ periode, aggreg });
	} catch (error) {
		console.error('Erreur rapport carburant:', error);
		return res.status(500).json({ error: 'Erreur serveur' });
	}
}

// Confirmer la récupération de carburant par un chauffeur
async function confirmerRecuperationCarburant(req, res) {
	try {
		const { attributionCarburantId, quantite, notes } = req.body;
		
		// Récupérer l'ID du chauffeur depuis le token ou les paramètres
		let chauffeurId;
		
		// Si c'est un appel admin (avec chauffeurId dans le body)
		if (req.body.chauffeurId) {
			chauffeurId = req.body.chauffeurId;
		} 
		// Si c'est un appel chauffeur (depuis le middleware d'auth)
		else if (req.chauffeurId) {
			chauffeurId = req.chauffeurId;
		}
		// Si c'est un appel direct (pour les tests)
		else if (req.query.chauffeurId) {
			chauffeurId = Number(req.query.chauffeurId);
		}
		// Sinon, essayer de récupérer depuis le token dans l'Authorization header
		else {
			const authHeader = req.headers.authorization;
			if (authHeader && authHeader.startsWith('Bearer ')) {
				const token = authHeader.substring(7);
				// Ici on devrait décoder le token pour récupérer l'ID du chauffeur
				// Pour l'instant, on va utiliser une approche différente
				console.log('Token reçu:', token);
			}
			
			// Si on n'a toujours pas l'ID, on ne peut pas continuer
			if (!chauffeurId) {
				return res.status(400).json({ error: 'ID du chauffeur requis' });
			}
		}

		if (!attributionCarburantId || typeof quantite !== 'number') {
			return res.status(400).json({ error: 'attributionCarburantId et quantite sont requis' });
		}

		// Vérifier que l'attribution existe et appartient au chauffeur
		const attribution = await prisma.attributionCarburant.findUnique({
			where: { id: Number(attributionCarburantId) },
			include: {
				vehicule: {
					include: {
						chauffeur: true
					}
				}
			}
		});

		if (!attribution) {
			return res.status(404).json({ error: 'Attribution de carburant non trouvée' });
		}

		// Vérifier que le chauffeur est bien assigné à ce véhicule
		if (!attribution.vehicule.chauffeur || attribution.vehicule.chauffeur.id !== chauffeurId) {
			return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à confirmer cette attribution' });
		}

		// Vérifier qu'il n'y a pas déjà une confirmation pour cette attribution
		const confirmationExistante = await prisma.confirmationRecuperationCarburant.findFirst({
			where: { attributionCarburantId: Number(attributionCarburantId) }
		});

		if (confirmationExistante) {
			return res.status(400).json({ error: 'Cette attribution a déjà été confirmée' });
		}

		// Créer la confirmation
		const confirmation = await prisma.confirmationRecuperationCarburant.create({
			data: {
				vehiculeId: attribution.vehiculeId,
				attributionCarburantId: Number(attributionCarburantId),
				chauffeurId,
				quantite,
				notes: notes || null
			},
			include: {
				vehicule: true,
				chauffeur: true
			}
		});

		console.log(`✅ Confirmation carburant: ${quantite}L confirmés par ${confirmation.chauffeur.prenom} ${confirmation.chauffeur.nom}`);

		return res.status(201).json({
			message: 'Récupération confirmée',
			confirmation: {
				id: confirmation.id,
				quantite: confirmation.quantite,
				dateConfirmation: confirmation.dateConfirmation,
				vehicule: confirmation.vehicule.immatriculation,
				chauffeur: `${confirmation.chauffeur.prenom} ${confirmation.chauffeur.nom}`
			}
		});

	} catch (error) {
		console.error('Erreur confirmation récupération carburant:', error);
		return res.status(500).json({ error: 'Erreur serveur' });
	}
}

// Obtenir les confirmations récentes pour les notifications admin
async function getConfirmationsRecentes(req, res) {
	try {
		// Récupérer les confirmations des dernières 24h
		const vingtQuatreHeuresAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

		const confirmations = await prisma.confirmationRecuperationCarburant.findMany({
			where: {
				dateConfirmation: {
					gte: vingtQuatreHeuresAgo
				}
			},
			include: {
				vehicule: true,
				chauffeur: true,
				attributionCarburant: true
			},
			orderBy: {
				dateConfirmation: 'desc'
			}
		});

		const confirmationsFormatees = confirmations.map(conf => ({
			id: conf.id,
			vehiculeImmatriculation: conf.vehicule.immatriculation,
			chauffeurNom: `${conf.chauffeur.prenom} ${conf.chauffeur.nom}`,
			quantite: conf.quantite,
			dateConfirmation: conf.dateConfirmation,
			dateAttribution: conf.attributionCarburant.date
		}));

		return res.json({
			confirmations: confirmationsFormatees
		});

	} catch (error) {
		console.error('Erreur récupération confirmations récentes:', error);
		return res.status(500).json({ error: 'Erreur serveur' });
	}
}

// Obtenir l'historique des confirmations pour un véhicule
async function getHistoriqueConfirmationsVehicule(req, res) {
	try {
		const { vehiculeId } = req.params;

		const confirmations = await prisma.confirmationRecuperationCarburant.findMany({
			where: {
				vehiculeId: Number(vehiculeId)
			},
			include: {
				chauffeur: true,
				attributionCarburant: true
			},
			orderBy: {
				dateConfirmation: 'desc'
			}
		});

		const historiqueFormate = confirmations.map(conf => ({
			id: conf.id,
			dateConfirmation: conf.dateConfirmation,
			quantite: conf.quantite,
			chauffeur: `${conf.chauffeur.prenom} ${conf.chauffeur.nom}`,
			dateAttribution: conf.attributionCarburant.date,
			quantiteAttribuee: conf.attributionCarburant.quantite,
			notes: conf.notes
		}));

		return res.json({
			historique: historiqueFormate
		});

	} catch (error) {
		console.error('Erreur récupération historique confirmations:', error);
		return res.status(500).json({ error: 'Erreur serveur' });
	}
}

module.exports = {
	getEstimation,
	attribuerCarburant,
	getHistoriqueVehicule,
	getHistoriqueGlobal,
	getRapport,
	confirmerRecuperationCarburant,
	getConfirmationsRecentes,
	getHistoriqueConfirmationsVehicule
};


