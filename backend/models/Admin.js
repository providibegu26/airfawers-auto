const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

class Admin {
  // Créer un admin (pour l'initialisation)
  static async createAdmin(email, password, nom, prenom, postNom, telephone) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const admin = await prisma.admin.create({
        data: {
          email,
          password: hashedPassword,
          nom,
          prenom,
          postNom,
          telephone,
          isFirstLogin: true
        }
      });
      
      return { success: true, admin: { ...admin, password: undefined } };
    } catch (error) {
      console.error('Erreur création admin:', error);
      return { success: false, error: 'Erreur lors de la création de l\'admin' };
    }
  }

  // Authentifier un admin
  static async authenticateAdmin(email, password) {
    try {
      const admin = await prisma.admin.findUnique({
        where: { email }
      });

      if (!admin) {
        return { success: false, error: 'Email ou mot de passe incorrect' };
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return { success: false, error: 'Email ou mot de passe incorrect' };
      }

      // Générer le token JWT
      const token = jwt.sign(
        { 
          id: admin.id, 
          email: admin.email,
          isFirstLogin: admin.isFirstLogin 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return {
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
      };
    } catch (error) {
      console.error('Erreur authentification admin:', error);
      return { success: false, error: 'Erreur lors de l\'authentification' };
    }
  }

  // Vérifier un token
  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.id }
      });

      if (!admin) {
        return { success: false, error: 'Admin non trouvé' };
      }

      return {
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
        }
      };
    } catch (error) {
      console.error('Erreur vérification token:', error);
      return { success: false, error: 'Token invalide' };
    }
  }

  // Changer le mot de passe
  static async changePassword(adminId, currentPassword, newPassword) {
    try {
      const admin = await prisma.admin.findUnique({
        where: { id: adminId }
      });

      if (!admin) {
        return { success: false, error: 'Admin non trouvé' };
      }

      const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
      if (!isValidPassword) {
        return { success: false, error: 'Mot de passe actuel incorrect' };
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      await prisma.admin.update({
        where: { id: adminId },
        data: {
          password: hashedNewPassword,
          isFirstLogin: false
        }
      });

      return { success: true, message: 'Mot de passe changé avec succès' };
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      return { success: false, error: 'Erreur lors du changement de mot de passe' };
    }
  }

  // Mettre à jour le profil admin
  static async updateProfile(adminId, profileData) {
    try {
      const admin = await prisma.admin.update({
        where: { id: adminId },
        data: {
          nom: profileData.nom,
          prenom: profileData.prenom,
          postNom: profileData.postNom,
          telephone: profileData.telephone,
          photo: profileData.photo
        }
      });

      return {
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
        }
      };
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      return { success: false, error: 'Erreur lors de la mise à jour du profil' };
    }
  }

  // Récupérer tous les admins
  static async getAllAdmins() {
    try {
      const admins = await prisma.admin.findMany({
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
          postNom: true,
          telephone: true,
          photo: true,
          isFirstLogin: true,
          createdAt: true
        }
      });

      return { success: true, admins };
    } catch (error) {
      console.error('Erreur récupération admins:', error);
      return { success: false, error: 'Erreur lors de la récupération des admins' };
    }
  }
}

module.exports = Admin; 