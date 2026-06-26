const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware d'authentification
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token d\'accès requis' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id }
    });

    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        error: 'Admin non trouvé' 
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      error: 'Token invalide' 
    });
  }
};

// Login admin
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email et mot de passe requis'
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        nom: admin.nom,
        prenom: admin.prenom,
        postNom: admin.postNom,
        telephone: admin.telephone,
        photo: admin.photo,
        isFirstLogin: admin.isFirstLogin
      },
      token
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'authentification'
    });
  }
};

// Vérifier le token
const verify = async (req, res) => {
  try {
    res.json({
      success: true,
      admin: req.admin
    });
  } catch (error) {
    console.error('Erreur vérification:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification'
    });
  }
};

// Changer le mot de passe
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.id;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    });

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Mot de passe actuel incorrect'
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.admin.update({
      where: { id: adminId },
      data: { 
        password: hashedNewPassword,
        isFirstLogin: false
      }
    });

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du changement de mot de passe'
    });
  }
};

// Mettre à jour le profil
const updateProfile = async (req, res) => {
  try {
    const { nom, prenom, postNom, telephone, email } = req.body;
    const adminId = req.admin.id;

    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: {
        nom: nom || undefined,
        prenom: prenom || undefined,
        postNom: postNom || undefined,
        telephone: telephone || undefined,
        email: email || undefined
      }
    });

    res.json({
      success: true,
      admin: updatedAdmin
    });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du profil'
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    // Dans une implémentation plus avancée, on pourrait invalider le token
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur logout:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la déconnexion'
    });
  }
};

// Créer un admin (pour l'initialisation)
const createAdmin = async (req, res) => {
  try {
    const { email, password, nom, prenom, postNom, telephone } = req.body;

    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        error: 'Un admin avec cet email existe déjà'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        nom: nom || 'Admin',
        prenom: prenom || 'Principal',
        postNom: postNom || 'Airfawers',
        telephone: telephone || '+243000000000',
        isFirstLogin: true
      }
    });

    res.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        nom: admin.nom,
        prenom: admin.prenom,
        postNom: admin.postNom,
        telephone: admin.telephone,
        isFirstLogin: admin.isFirstLogin
      }
    });
  } catch (error) {
    console.error('Erreur création admin:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de l\'admin'
    });
  }
};

module.exports = {
  login,
  verify,
  changePassword,
  updateProfile,
  logout,
  createAdmin,
  authenticateToken
}; 