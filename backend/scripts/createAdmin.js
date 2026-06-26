const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: 'airfawersauto@gmail.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin existe déjà:', existingAdmin.email);
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Créer l'admin
    const admin = await prisma.admin.create({
      data: {
        email: 'airfawersauto@gmail.com',
        password: hashedPassword,
        nom: 'Admin',
        prenom: 'Principal',
        postNom: 'Airfawers',
        telephone: '+243000000000',
        isFirstLogin: true
      }
    });

    console.log('✅ Admin créé avec succès:', {
      id: admin.id,
      email: admin.email,
      nom: admin.nom,
      prenom: admin.prenom
    });
  } catch (error) {
    console.error('❌ Erreur création admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin(); 