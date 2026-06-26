const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Vérifier l'email
async function checkEmail(req, res) {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== 'chauffeur') {
    return res.status(404).json({ exists: false });
  }
  return res.json({ exists: true, motDePasseDefini: user.motDePasseDefini });
}

// 2. Définir le mot de passe à la première connexion
async function setPassword(req, res) {
  const { email, motDePasse } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== 'chauffeur') {
    return res.status(404).json({ error: "Utilisateur non trouvé" });
  }
  if (user.motDePasseDefini) {
    return res.status(400).json({ error: "Mot de passe déjà défini" });
  }
  const hashed = await bcrypt.hash(motDePasse, 10);
  await prisma.user.update({
    where: { email },
    data: { motDePasse: hashed, motDePasseDefini: true }
  });
  return res.json({ message: "Mot de passe défini avec succès" });
}

// 3. Login classique chauffeur
async function loginChauffeur(req, res) {
  const { email, motDePasse } = req.body;
  const user = await prisma.user.findUnique({ 
    where: { email },
    include: { chauffeur: true }
  });
  
  if (!user || user.role !== 'chauffeur') {
    return res.status(404).json({ error: "Utilisateur non trouvé" });
  }
  
  // Si le mot de passe n'est pas défini, on ne peut pas se connecter
  if (!user.motDePasseDefini) {
    return res.status(400).json({ 
      error: "Mot de passe non défini. Veuillez d'abord définir votre mot de passe." 
    });
  }
  
  const valid = await bcrypt.compare(motDePasse, user.motDePasse);
  if (!valid) {
    return res.status(401).json({ error: "Mot de passe incorrect" });
  }
  
  // Générer un JWT
  const token = jwt.sign(
    { 
      userId: user.id, 
      role: user.role,
      chauffeurId: user.chauffeur?.id 
    }, 
    process.env.JWT_SECRET || 'secret', 
    { expiresIn: '1d' }
  );
  
  return res.json({ 
    token, 
    user: { 
      id: user.id, 
      email: user.email,
      chauffeur: {
        id: user.chauffeur?.id,
        nom: user.chauffeur?.nom,
        prenom: user.chauffeur?.prenom
      }
    } 
  });
}

module.exports = { checkEmail, setPassword, loginChauffeur }; 