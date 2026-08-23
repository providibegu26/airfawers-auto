/**
 * Bootstrap CLI — crée le premier administrateur (pas d'endpoint public).
 *
 * Usage :
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=MotDePasseFort node scripts/createAdmin.js
 *   node scripts/createAdmin.js --email admin@example.com --password MotDePasseFort
 *   node scripts/createAdmin.js --email admin@example.com --password MotDePasseFort --nom Admin --prenom Principal
 *
 * Variables optionnelles : ADMIN_NOM, ADMIN_PRENOM, ADMIN_POSTNOM, ADMIN_TELEPHONE
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--') && i + 1 < argv.length) {
      result[arg.slice(2)] = argv[i + 1];
      i += 1;
    }
  }
  return result;
}

async function createAdmin() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const email = (args.email || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const password = args.password || process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.error(
        '❌ Email et mot de passe requis.\n' +
          '   Exemple : ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=... node scripts/createAdmin.js\n' +
          '   Ou : node scripts/createAdmin.js --email admin@example.com --password ...'
      );
      process.exitCode = 1;
      return;
    }

    if (String(password).length < 8) {
      console.error('❌ Le mot de passe doit contenir au moins 8 caractères.');
      process.exitCode = 1;
      return;
    }

    const existingAdmin = await prisma.admin.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (existingAdmin) {
      console.log('ℹ️  Admin déjà existant :', existingAdmin.email);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        nom: args.nom || process.env.ADMIN_NOM || 'Admin',
        prenom: args.prenom || process.env.ADMIN_PRENOM || 'Principal',
        postNom: args.postnom || process.env.ADMIN_POSTNOM || null,
        telephone: args.telephone || process.env.ADMIN_TELEPHONE || null,
        isFirstLogin: true,
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        postNom: true,
        telephone: true,
        isFirstLogin: true,
      },
    });

    console.log('✅ Admin créé avec succès :', admin);
  } catch (error) {
    console.error('❌ Erreur création admin:', error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
