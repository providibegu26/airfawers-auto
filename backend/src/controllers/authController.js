const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendMail } = require('../config/email');
const { buildChauffeurWelcomeEmailHtml, buildChauffeurWelcomeEmailText } = require('../templates/chauffeurWelcomeEmail');
const { normalizeEmail, normalizePassword } = require('../utils/normalizeCredentials');
const prisma = new PrismaClient();

// Authentification Admin
async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;
    
    // Vérifier les identifiants admin fixes
    if (email === 'airfawersauto@gmail.com' && password === 'admin123') {
      const adminToken = jwt.sign(
        { 
          id: 'admin',
          email: email,
          role: 'admin'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        message: 'Connexion admin réussie',
        token: adminToken,
        user: {
          id: 'admin',
          email: email,
          role: 'admin'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Identifiants admin incorrects'
      });
    }
  } catch (error) {
    console.error('Erreur connexion admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
}

// Authentification Chauffeur
async function loginChauffeur(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const password = normalizePassword(req.body.password);
    
    console.log('🔐 Tentative de connexion chauffeur:', { email, passwordLength: password?.length });
    
    if (!email || !password) {
      console.log('❌ Email ou mot de passe manquant');
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }
    
    // Trouver l'utilisateur par email (insensible à la casse)
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
      },
      include: {
        chauffeur: true
      }
    });
    
    console.log('🔍 Résultat recherche utilisateur:', {
      userExists: !!user,
      hasChauffeur: !!user?.chauffeur,
      motDePasseDefini: user?.motDePasseDefini,
      role: user?.role,
      email: user?.email
    });
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé dans la base de données pour:', email);
      // Vérifier tous les utilisateurs pour debug
      const allUsers = await prisma.user.findMany({
        select: { email: true, role: true }
      });
      console.log('📋 Tous les utilisateurs dans la DB:', allUsers);
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    if (!user.chauffeur) {
      console.log('❌ Aucun chauffeur associé à cet utilisateur:', email);
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.motDePasse);
    
    console.log('🔑 Vérification mot de passe:', { isValidPassword });
    
    if (!isValidPassword) {
      console.log('❌ Mot de passe incorrect pour:', email);
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Comptes legacy : mot de passe temporaire hashé mais motDePasseDefini encore à false
    if (!user.motDePasseDefini) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          motDePasseDefini: true,
          doitChangerMotDePasse: true,
        },
      });
      user.motDePasseDefini = true;
      user.doitChangerMotDePasse = true;
    }
    
    console.log('✅ Connexion réussie pour:', email);
    
    // Générer le token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        chauffeurId: user.chauffeur.id,
        role: 'chauffeur'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Connexion chauffeur réussie',
      token: token,
      requiresPasswordChange: Boolean(user.doitChangerMotDePasse),
      user: {
        id: user.id,
        email: user.email,
        chauffeur: {
          id: user.chauffeur.id,
          nom: user.chauffeur.nom,
          prenom: user.chauffeur.prenom
        },
        role: 'chauffeur',
        doitChangerMotDePasse: Boolean(user.doitChangerMotDePasse),
      }
    });
    
  } catch (error) {
    console.error('Erreur connexion chauffeur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
}

// Créer un compte chauffeur et envoyer les identifiants
async function createChauffeurAccount(req, res) {
  try {
    console.log(' Création chauffeur - Données reçues:', req.body);
    
    const { nom, postnom, prenom, telephone, sexe } = req.body;
    const email = normalizeEmail(req.body.email);
    
    // Validation des données selon le schéma Prisma
    if (!nom || !postnom || !prenom || !email || !telephone || !sexe) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont obligatoires (nom, postnom, prenom, email, telephone, sexe)'
      });
    }
    
    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
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
        motDePasse: hashedPassword,
        motDePasseDefini: true,
        doitChangerMotDePasse: true,
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
      html: buildChauffeurWelcomeEmailHtml({ prenom, nom, email, password }),
      text: buildChauffeurWelcomeEmailText({ prenom, nom, email, password }),
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
        ? 'Compte chauffeur créé avec succès. Les identifiants ont été envoyés par email.'
        : 'Compte chauffeur créé. L\'email n\'a pas pu être envoyé — communiquez les identifiants manuellement.',
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
        password: password // Retourner le mot de passe pour l'affichage admin
      }
    });
    
  } catch (error) {
    console.error(' Erreur création compte chauffeur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte',
      error: error.message
    });
  }
}

// Récupérer le profil du chauffeur connecté
async function getChauffeurProfile(req, res) {
  try {
    console.log(' getChauffeurProfile appelé');
    console.log(' req.user:', req.user);
    
    const chauffeurId = req.user.chauffeurId;
    console.log(' chauffeurId:', chauffeurId);
    
    if (!chauffeurId) {
      console.log(' chauffeurId manquant');
      return res.status(400).json({
        success: false,
        message: 'ID chauffeur manquant dans le token'
      });
    }
    
    console.log('🔍 Recherche chauffeur avec ID:', chauffeurId);
    const chauffeur = await prisma.chauffeur.findUnique({
      where: { id: chauffeurId },
      include: {
        user: {
          select: {
            email: true,
            doitChangerMotDePasse: true,
          }
        },
        vehicules: true
      }
    });
    
    console.log(' Chauffeur trouvé:', chauffeur ? 'Oui' : 'Non');
    if (chauffeur) {
      console.log(' Véhicules attribués:', chauffeur.vehicules ? chauffeur.vehicules.length : 0);
      if (chauffeur.vehicules && chauffeur.vehicules.length > 0) {
        console.log('Premier véhicule:', chauffeur.vehicules[0].immatriculation);
      }
    }
    
    if (!chauffeur) {
      console.log('Chauffeur non trouvé');
      return res.status(404).json({
        success: false,
        message: 'Chauffeur non trouvé'
      });
    }
    
    // Calculer les estimations d'entretien si un véhicule est attribué
    let vehiculeWithEstimations = null;
    if (chauffeur.vehicules && chauffeur.vehicules.length > 0) {
      const vehicule = chauffeur.vehicules[0];
      
      // Seuils d'entretien basés sur la catégorie
      const thresholds = {
        LIGHT: { vidange: 10000, categorie_b: 20000, categorie_c: 40000 },
        HEAVY: { vidange: 8000, categorie_b: 15000, categorie_c: 30000 }
      };

      // Normaliser la catégorie
      const category = vehicule.categorie === 'LIGHT' ? 'LIGHT' : 'HEAVY';
      const weeklyKm = vehicule.weeklyKm || 500; // Valeur par défaut

      console.log(`🔧 Calcul estimations pour véhicule ${vehicule.immatriculation} (${category})`);

      vehiculeWithEstimations = {
        ...vehicule,
        vidangeDaysRemaining: null,
        categorie_bDaysRemaining: null,
        categorie_cDaysRemaining: null
      };

      // Calculer pour chaque type d'entretien
      ['vidange', 'categorie_b', 'categorie_c'].forEach(type => {
        const threshold = thresholds[category][type];
        const kmSinceLastMaintenance = vehicule.kilometrage % threshold;
        const kmUntilNext = threshold - kmSinceLastMaintenance;
        const weeksRemaining = Math.ceil(kmUntilNext / weeklyKm);
        const daysRemaining = weeksRemaining * 7;

        vehiculeWithEstimations[`${type}DaysRemaining`] = daysRemaining;
        
        console.log(`  ${type}: ${daysRemaining} jours restants (${kmUntilNext} km)`);
      });
    }

    const response = {
      success: true,
      chauffeur: {
        id: chauffeur.id,
        nom: chauffeur.nom,
        postnom: chauffeur.postnom,
        prenom: chauffeur.prenom,
        sexe: chauffeur.sexe,
        statut: chauffeur.statut,
        telephone: chauffeur.telephone,
        photoUrl: chauffeur.photoUrl,
        email: chauffeur.user.email,
        user: {
          email: chauffeur.user.email,
          doitChangerMotDePasse: chauffeur.user.doitChangerMotDePasse,
        },
        vehicule: vehiculeWithEstimations
      }
    };
    
    console.log(' Réponse envoyée:', response);
    res.json(response);
    
  } catch (error) {
    console.error(' Erreur récupération profil chauffeur:', error);
    console.error(' Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
}

async function personalizeChauffeurPassword(req, res) {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe et sa confirmation sont requis',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Les mots de passe ne correspondent pas',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user || user.role !== 'chauffeur') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé',
      });
    }

    if (!user.doitChangerMotDePasse) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe a déjà été personnalisé',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        motDePasse: hashedPassword,
        motDePasseDefini: true,
        doitChangerMotDePasse: false,
      },
    });

    return res.json({
      success: true,
      message: 'Mot de passe personnalisé avec succès',
    });
  } catch (error) {
    console.error('Erreur personnalisation mot de passe:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
}

module.exports = {
  loginAdmin,
  loginChauffeur,
  createChauffeurAccount,
  getChauffeurProfile,
  personalizeChauffeurPassword,
};
