const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

// Configuration email (à adapter selon votre setup)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.EMAIL_USER || 'airfawersauto@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Demander un changement de mot de passe
async function requestPasswordChange(req, res) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    // Vérifier que le chauffeur existe
    const chauffeur = await prisma.chauffeur.findFirst({
      where: {
        user: {
          email: email
        }
      },
      include: {
        user: true
      }
    });

    if (!chauffeur) {
      return res.status(404).json({ error: 'Chauffeur non trouvé' });
    }

    // Générer un code temporaire à 6 chiffres
    const code = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    
    // Code expire dans 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Supprimer les anciennes demandes non utilisées
    await prisma.passwordChangeRequest.deleteMany({
      where: {
        chauffeurId: chauffeur.id,
        used: false,
        expiresAt: {
          lt: new Date()
        }
      }
    });

    // Créer la nouvelle demande
    const passwordRequest = await prisma.passwordChangeRequest.create({
      data: {
        chauffeurId: chauffeur.id,
        code: code,
        expiresAt: expiresAt
      }
    });

    // Envoyer l'email avec le code
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@airfawers.com',
      to: email,
      subject: 'Code de changement de mot de passe - Airfawers Auto',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🔐 Changement de mot de passe</h2>
          <p>Bonjour ${chauffeur.prenom} ${chauffeur.nom},</p>
          <p>Vous avez demandé un changement de mot de passe pour votre compte chauffeur.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h3 style="color: #059669; margin: 0;">Votre code de confirmation</h3>
            <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; margin: 10px 0;">
              ${code}
            </div>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Ce code expire dans 15 minutes
            </p>
          </div>
          <p style="color: #dc2626; font-size: 14px;">
            ⚠️ Ne partagez jamais ce code avec qui que ce soit.
          </p>
          <p>Si vous n'avez pas demandé ce changement, ignorez cet email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Airfawers Auto - Gestion de flotte
          </p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`📧 Code de changement de mot de passe envoyé à ${email}: ${code}`);
    } catch (emailError) {
      console.log(`⚠️ Erreur email, code affiché dans la console: ${code}`);
      console.error('Erreur email:', emailError);
    }

    return res.status(200).json({
      success: true,
      message: 'Code de confirmation envoyé par email',
      expiresIn: '15 minutes'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la demande de changement de mot de passe:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// Confirmer le changement de mot de passe
async function confirmPasswordChange(req, res) {
  try {
    const { email, code, newPassword } = req.body;
    
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code et nouveau mot de passe requis' });
    }

    // Vérifier que le chauffeur existe
    const chauffeur = await prisma.chauffeur.findFirst({
      where: {
        user: {
          email: email
        }
      },
      include: {
        user: true
      }
    });

    if (!chauffeur) {
      return res.status(404).json({ error: 'Chauffeur non trouvé' });
    }

    // Vérifier le code et qu'il n'a pas expiré
    const passwordRequest = await prisma.passwordChangeRequest.findFirst({
      where: {
        chauffeurId: chauffeur.id,
        code: code,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!passwordRequest) {
      return res.status(400).json({ error: 'Code invalide ou expiré' });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    console.log(`🔐 Mise à jour du mot de passe pour l'utilisateur ${chauffeur.userId}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🆔 Chauffeur ID: ${chauffeur.id}`);
    console.log(`🆔 User ID: ${chauffeur.userId}`);

    // Mettre à jour le mot de passe
    const updatedUser = await prisma.user.update({
      where: { id: chauffeur.userId },
      data: { motDePasse: hashedPassword }
    });
    
    console.log(`✅ Utilisateur mis à jour:`, updatedUser.id);

    // Marquer le code comme utilisé
    await prisma.passwordChangeRequest.update({
      where: { id: passwordRequest.id },
      data: { used: true }
    });

    console.log(`✅ Mot de passe changé avec succès pour ${email}`);

    return res.status(200).json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la confirmation du changement de mot de passe:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = {
  requestPasswordChange,
  confirmPasswordChange
};
