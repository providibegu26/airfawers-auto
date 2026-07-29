const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { getJwtSecret } = require('../src/middleware/auth');
const { sanitizeAdmin } = require('../src/utils/sanitizeAdmin');

const prisma = new PrismaClient();

const ADMIN_SAFE_SELECT = {
  id: true,
  email: true,
  nom: true,
  prenom: true,
  postNom: true,
  telephone: true,
  photo: true,
  isFirstLogin: true,
  createdAt: true,
  updatedAt: true,
};

// Login admin (BDD + bcrypt)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email et mot de passe requis',
        message: 'Email et mot de passe requis',
      });
    }

    const admin = await prisma.admin.findFirst({
      where: { email: { equals: String(email).trim(), mode: 'insensitive' } },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect',
        message: 'Email ou mot de passe incorrect',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect',
        message: 'Email ou mot de passe incorrect',
      });
    }

    const safeAdmin = sanitizeAdmin(admin);
    const userPayload = {
      id: admin.id,
      email: admin.email,
      role: 'admin',
    };

    const token = jwt.sign(userPayload, getJwtSecret(), { expiresIn: '24h' });

    res.json({
      success: true,
      message: 'Connexion admin réussie',
      admin: safeAdmin,
      user: {
        ...userPayload,
        nom: admin.nom,
        prenom: admin.prenom,
        isFirstLogin: admin.isFirstLogin,
      },
      token,
    });
  } catch (error) {
    console.error('Erreur login admin:', error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'authentification",
      message: "Erreur lors de l'authentification",
    });
  }
};

// Vérifier le token
const verify = async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.user.id },
      select: ADMIN_SAFE_SELECT,
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Admin non trouvé',
        message: 'Admin non trouvé',
      });
    }

    res.json({
      success: true,
      admin,
      user: {
        id: admin.id,
        email: admin.email,
        role: 'admin',
      },
    });
  } catch (error) {
    console.error('Erreur vérification:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification',
      message: 'Erreur lors de la vérification',
    });
  }
};

// Changer le mot de passe
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.user.id;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Admin non trouvé',
        message: 'Admin non trouvé',
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      admin.password
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Mot de passe actuel incorrect',
        message: 'Mot de passe actuel incorrect',
      });
    }

    if (!newPassword || String(newPassword).length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Le nouveau mot de passe doit contenir au moins 8 caractères',
        message: 'Le nouveau mot de passe doit contenir au moins 8 caractères',
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.admin.update({
      where: { id: adminId },
      data: {
        password: hashedNewPassword,
        isFirstLogin: false,
      },
    });

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès',
    });
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du changement de mot de passe',
      message: 'Erreur lors du changement de mot de passe',
    });
  }
};

// Mettre à jour le profil
const updateProfile = async (req, res) => {
  try {
    const { nom, prenom, postNom, telephone, email } = req.body;
    const adminId = req.user.id;

    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: {
        nom: nom || undefined,
        prenom: prenom || undefined,
        postNom: postNom || undefined,
        telephone: telephone || undefined,
        email: email || undefined,
      },
      select: ADMIN_SAFE_SELECT,
    });

    res.json({
      success: true,
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du profil',
      message: 'Erreur lors de la mise à jour du profil',
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (error) {
    console.error('Erreur logout:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la déconnexion',
      message: 'Erreur lors de la déconnexion',
    });
  }
};

module.exports = {
  login,
  verify,
  changePassword,
  updateProfile,
  logout,
};
