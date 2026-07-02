const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { normalizeEmail } = require('../utils/normalizeCredentials');

async function createChauffeurService({ nom, postnom, prenom, sexe, telephone, email }) {
  const normalizedEmail = normalizeEmail(email);

  // Vérifier si l'email existe déjà
  const existingUser = await prisma.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
  });
  if (existingUser) {
    throw new Error('Email déjà utilisé');
  }
  
  // Générer un mot de passe temporaire (aligné avec authController)
  const motDePasseTemporaire = crypto.randomBytes(6).toString('hex');
  const motDePasseHash = await bcrypt.hash(motDePasseTemporaire, 10);
  
  // Création du user avec mot de passe temporaire utilisable à la connexion
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      motDePasse: motDePasseHash,
      role: 'chauffeur',
      motDePasseDefini: true,
      doitChangerMotDePasse: true,
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