const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendMail } = require('../config/email');
const prisma = new PrismaClient();

// Créer un nouveau chauffeur (version corrigée selon le schéma Prisma)
async function createChauffeur(req, res) {
  try {
    console.log(' Création chauffeur - Données reçues:', req.body);
    
    const { nom, postnom, prenom, email, telephone, sexe } = req.body;
    
    // Validation des données selon le schéma Prisma
    if (!nom || !postnom || !prenom || !email || !telephone || !sexe) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont obligatoires (nom, postnom, prenom, email, telephone, sexe)'
      });
    }
    
    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un compte avec cet email existe déjà'
      });
    }
    
    // Générer un mot de passe aléatoire
    const password = crypto.randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log(' Mot de passe généré:', password);
    
    // Créer l'utilisateur et le chauffeur selon le schéma Prisma
    const user = await prisma.user.create({
      data: {
        email,
        motDePasse: hashedPassword, // Utiliser motDePasse au lieu de password
        motDePasseDefini: true,
        role: 'chauffeur',
        chauffeur: {
          create: {
            nom,
            postnom, // Champ obligatoire selon le schéma
            prenom,
            telephone,
            sexe,
            statut: 'Non attribué', // Valeur par défaut
            dateEmbauche: new Date() // Valeur par défaut
          }
        }
      },
      include: {
        chauffeur: true
      }
    });
    
    console.log(' Chauffeur créé avec succès:', user.chauffeur.id);
    
    // Envoyer l'email avec les identifiants
    const mailOptions = {
      to: email,
      subject: 'Vos identifiants de connexion - Airfawers Auto',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🚗 Bienvenue chez Airfawers Auto !</h2>
          <p>Bonjour ${prenom} ${nom},</p>
          <p>Votre compte chauffeur a été créé avec succès par l'administrateur.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #059669; margin: 0;">🔐 Vos identifiants de connexion</h3>
            <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #2563eb;">
              <p style="margin: 5px 0;"><strong>📧 Email :</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>🔑 Mot de passe :</strong> <span style="font-family: monospace; font-size: 16px; color: #2563eb; font-weight: bold;">${password}</span></p>
            </div>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>⚠️ Important :</strong> Conservez précieusement ces informations de connexion.</p>
          </div>
          
          <p>Vous pouvez maintenant vous connecter à votre espace chauffeur en utilisant ces identifiants.</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Cordialement,<br>L'équipe Airfawers Auto
          </p>
        </div>
      `
    };
    
    let emailSent = false;
    let emailError = null;
    try {
      await sendMail(mailOptions);
      emailSent = true;
      console.log(' Email envoyé avec succès à:', email);
    } catch (err) {
      emailError = err.message;
      console.error(' Erreur envoi email:', err);
    }

    res.status(201).json({
      success: true,
      message: emailSent
        ? 'Chauffeur créé avec succès. Les identifiants ont été envoyés par email.'
        : 'Chauffeur créé. L\'email n\'a pas pu être envoyé — communiquez les identifiants manuellement.',
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
      },
      credentials: {
        email: user.email,
        password: password
      }
    });
    
  } catch (error) {
    console.error(' Erreur création chauffeur:', error);
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
