const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

async function createChauffeurService({ nom, postnom, prenom, sexe, telephone, email }) {
  // Vérifier si l'email existe déjà
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Email déjà utilisé');
  }
  
  // Générer un mot de passe temporaire
  const motDePasseTemporaire = Math.random().toString(36).slice(-8);
  const motDePasseHash = await bcrypt.hash(motDePasseTemporaire, 10);
  
  // Création du user avec mot de passe temporaire
  const user = await prisma.user.create({
    data: {
      email,
      motDePasse: motDePasseHash,
      role: 'chauffeur',
      motDePasseDefini: false, // Le chauffeur devra définir son mot de passe au premier login
      chauffeur: {
        create: {
          nom,
          postnom,
          prenom,
          sexe,
          telephone,
          dateEmbauche: new Date(),
          statut: 'actif'
        },
      },
    },
    include: { chauffeur: true },
  });
  
  // Retourner les informations avec le mot de passe temporaire
  return {
    ...user,
    motDePasseTemporaire // Pour que l'admin puisse le communiquer au chauffeur
  };
}

module.exports = { createChauffeurService }; 