const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestChauffeur() {
  try {
    const testEmail = 'chauffeur@test.com';
    const testPassword = 'chauffeur123';

    // Vérifier si le chauffeur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail },
      include: { chauffeur: true }
    });

    if (existingUser) {
      console.log('⚠️ Chauffeur existe déjà:', testEmail);
      console.log('📧 Email:', testEmail);
      console.log('🔑 Mot de passe:', testPassword);
      console.log('👤 Nom:', existingUser.chauffeur?.nom || 'N/A');
      console.log('👤 Prénom:', existingUser.chauffeur?.prenom || 'N/A');
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    // Créer l'utilisateur et le chauffeur
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        motDePasse: hashedPassword,
        motDePasseDefini: true, // Important : le mot de passe est défini
        role: 'chauffeur',
        chauffeur: {
          create: {
            nom: 'Doe',
            postnom: 'Test',
            prenom: 'John',
            sexe: 'M',
            telephone: '+243900000000',
            statut: 'Non attribué',
            dateEmbauche: new Date()
          }
        }
      },
      include: {
        chauffeur: true
      }
    });

    console.log('\n✅ Chauffeur de test créé avec succès !\n');
    console.log('📋 Identifiants de connexion :');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email    :', testEmail);
    console.log('🔑 Mot de passe:', testPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('👤 Informations du chauffeur :');
    console.log('   ID:', user.id);
    console.log('   Nom:', user.chauffeur.nom);
    console.log('   Postnom:', user.chauffeur.postnom);
    console.log('   Prénom:', user.chauffeur.prenom);
    console.log('   Téléphone:', user.chauffeur.telephone);
    console.log('   Statut:', user.chauffeur.statut);
    console.log('   Mot de passe défini:', user.motDePasseDefini ? '✅ Oui' : '❌ Non');
    console.log('\n✨ Vous pouvez maintenant vous connecter avec ces identifiants !\n');

  } catch (error) {
    console.error('❌ Erreur création chauffeur:', error);
    if (error.code === 'P2002') {
      console.error('⚠️ Un utilisateur avec cet email existe déjà');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestChauffeur();

