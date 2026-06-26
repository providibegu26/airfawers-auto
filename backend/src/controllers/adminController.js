const prisma = require('../config/prisma');
const { createChauffeurService } = require('../services/chauffeurService');

async function createChauffeur(req, res) {
  try {
    const { nom, postnom, prenom, sexe, telephone, email } = req.body;
    
    // Validation des champs requis
    if (!nom || !postnom || !prenom || !sexe || !telephone || !email) {
      return res.status(400).json({ 
        error: 'Les champs nom, post-nom, prénom, sexe, téléphone et email sont obligatoires' 
      });
    }
    
    const user = await createChauffeurService({ nom, postnom, prenom, sexe, telephone, email });
    
    res.status(201).json({ 
      message: 'Chauffeur créé avec succès', 
      user: {
        id: user.chauffeur.id,
        nom: user.chauffeur.nom,
        postnom: user.chauffeur.postnom,
        prenom: user.chauffeur.prenom,
        sexe: user.chauffeur.sexe,
        telephone: user.chauffeur.telephone,
        email: user.email,
        motDePasseTemporaire: user.motDePasseTemporaire
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getAllChauffeurs(req, res) {
  try {
    const chauffeurs = await prisma.chauffeur.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            motDePasseDefini: true
          }
        },
        vehicules: {
          select: {
            id: true,
            immatriculation: true,
            marque: true,
            modele: true,
            categorie: true
          }
        }
      }
    });

    // Ajouter les informations de véhicule (le statut vient déjà de la base de données)
    const chauffeursWithStatus = chauffeurs.map(chauffeur => {
      const vehiculeAssigne = chauffeur.vehicules[0] || null;
      return {
        ...chauffeur,
        vehiculeAssigne: vehiculeAssigne
      };
    });

    res.json({ chauffeurs: chauffeursWithStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateChauffeur(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { nom, postnom, prenom, sexe, telephone } = req.body;
    
    const chauffeur = await prisma.chauffeur.update({
      where: { id },
      data: { nom, postnom, prenom, sexe, telephone },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            motDePasseDefini: true
          }
        }
      }
    });
    
    res.json({ 
      message: 'Chauffeur mis à jour', 
      chauffeur 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deleteChauffeur(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.chauffeur.delete({ where: { id } });
    res.json({ message: 'Chauffeur supprimé' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { createChauffeur, getAllChauffeurs, updateChauffeur, deleteChauffeur }; 