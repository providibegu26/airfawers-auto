const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendMail } = require('../config/email');
const { buildChauffeurWelcomeEmailHtml, buildChauffeurWelcomeEmailText } = require('../templates/chauffeurWelcomeEmail');
const { normalizeEmail } = require('../utils/normalizeCredentials');
const prisma = new PrismaClient();

// Créer un nouveau chauffeur (mot de passe uniquement par email)
async function createChauffeur(req, res) {
  try {
    const { nom, postnom, prenom, telephone, sexe } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!nom || !postnom || !prenom || !email || !telephone || !sexe) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont obligatoires (nom, postnom, prenom, email, telephone, sexe)'
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un compte avec cet email existe déjà'
      });
    }

    const password = crypto.randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        motDePasse: hashedPassword,
        motDePasseDefini: true,
        doitChangerMotDePasse: true,
        role: 'chauffeur',
        chauffeur: {
          create: {
            nom,
            postnom,
            prenom,
            telephone,
            sexe,
            statut: 'Non attribué',
            dateEmbauche: new Date()
          }
        }
      },
      include: {
        chauffeur: true
      }
    });

    const mailOptions = {
      to: email,
      subject: 'Vos identifiants de connexion - Airfawers Auto',
      html: buildChauffeurWelcomeEmailHtml({ prenom, nom, email, password }),
      text: buildChauffeurWelcomeEmailText({ prenom, nom, email, password }),
    };

    let emailSent = false;
    let emailError = null;
    try {
      await sendMail(mailOptions);
      emailSent = true;
    } catch (err) {
      emailError = err.message;
      console.error('Erreur envoi email création chauffeur:', err.message);
    }

    res.status(201).json({
      success: true,
      message: emailSent
        ? 'Chauffeur créé avec succès. Les identifiants ont été envoyés par email.'
        : 'Chauffeur créé. L\'email n\'a pas pu être envoyé — réessayez l\'envoi ou réinitialisez le mot de passe.',
      emailSent,
      emailError: emailSent ? undefined : emailError,
      chauffeur: {
        id: user.chauffeur.id,
        nom: user.chauffeur.nom,
        postnom: user.chauffeur.postnom,
        prenom: user.chauffeur.prenom,
        email: user.email,
        telephone: user.chauffeur.telephone,
        sexe: user.chauffeur.sexe,
        statut: user.chauffeur.statut
      }
    });

  } catch (error) {
    console.error('Erreur création chauffeur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du chauffeur',
      error: error.message
    });
  }
}

// Récupérer tous les chauffeurs
async function getAllChauffeurs(req, res) {
  try {
    const chauffeurs = await prisma.chauffeur.findMany({
      include: {
        user: {
          select: {
            email: true
          }
        },
        vehicules: true // Relation correcte selon le schéma
      }
    });
    
    res.json({
      success: true,
      chauffeurs: chauffeurs
    });
    
  } catch (error) {
    console.error('Erreur récupération chauffeurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des chauffeurs'
    });
  }
}

// Modifier un chauffeur
async function updateChauffeur(req, res) {
  try {
    const { id } = req.params;
    const { nom, postnom, prenom, telephone, sexe } = req.body;
    
    console.log(' Modification chauffeur:', { id, nom, postnom, prenom, telephone, sexe });
    
    // Validation des données
    if (!nom || !postnom || !prenom || !telephone || !sexe) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont obligatoires (nom, postnom, prenom, telephone, sexe)'
      });
    }
    
    // Mettre à jour le chauffeur
    const chauffeur = await prisma.chauffeur.update({
      where: { id: parseInt(id) },
      data: {
        nom,
        postnom,
        prenom,
        telephone,
        sexe
      },
      include: {
        user: {
          select: {
            email: true
          }
        },
        vehicules: true
      }
    });
    
    console.log(' Chauffeur modifié avec succès:', chauffeur.id);
    
    res.json({
      success: true,
      message: 'Chauffeur modifié avec succès',
      chauffeur: {
        id: chauffeur.id,
        nom: chauffeur.nom,
        postnom: chauffeur.postnom,
        prenom: chauffeur.prenom,
        email: chauffeur.user.email,
        telephone: chauffeur.telephone,
        sexe: chauffeur.sexe,
        statut: chauffeur.statut
      }
    });
    
  } catch (error) {
    console.error(' Erreur modification chauffeur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du chauffeur',
      error: error.message
    });
  }
}

// Supprimer un chauffeur
async function deleteChauffeur(req, res) {
  try {
    const { id } = req.params;
    
    console.log(' Suppression chauffeur:', id);
    
    // Vérifier si le chauffeur est assigné à un véhicule
    const chauffeur = await prisma.chauffeur.findUnique({
      where: { id: parseInt(id) },
      include: {
        vehicules: true
      }
    });
    
    if (!chauffeur) {
      return res.status(404).json({
        success: false,
        message: 'Chauffeur non trouvé'
      });
    }
    
    if (chauffeur.vehicules.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un chauffeur assigné à un véhicule'
      });
    }
    
    // Supprimer le chauffeur (cela supprimera aussi l'utilisateur associé grâce à la relation)
    await prisma.chauffeur.delete({
      where: { id: parseInt(id) }
    });
    
    console.log(' Chauffeur supprimé avec succès:', id);
    
    res.json({
      success: true,
      message: 'Chauffeur supprimé avec succès'
    });
    
  } catch (error) {
    console.error(' Erreur suppression chauffeur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du chauffeur',
      error: error.message
    });
  }
}

module.exports = {
  createChauffeur,
  getAllChauffeurs,
  updateChauffeur,
  deleteChauffeur
};
