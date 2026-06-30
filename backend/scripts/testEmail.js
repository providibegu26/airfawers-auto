require("dotenv").config();
const {
  sendMail,
  isEmailConfigured,
  getEmailProvider,
  getEmailFrom,
  verifyEmail,
} = require("../src/config/email");

async function main() {
  const testTo = process.argv[2] || getEmailFrom();

  console.log("Provider:", getEmailProvider() || "(aucun)");
  console.log("Configuré:", isEmailConfigured());
  console.log("Expéditeur:", getEmailFrom() || "(vide)");

  if (!isEmailConfigured()) {
    console.error("❌ Email non configuré.");
    process.exit(1);
  }

  const check = await verifyEmail();
  if (!check.ok) {
    console.error("❌ Vérification:", check.error);
    process.exit(1);
  }
  console.log("✅ Connexion email OK");

  try {
    await sendMail({
      to: testTo,
      subject: "Test email Airfawers Auto",
      html: "<p>Si vous recevez cet email, l'envoi fonctionne correctement.</p>",
      text: "Si vous recevez cet email, l'envoi fonctionne correctement.",
    });
    console.log("✅ Email de test envoyé à:", testTo);
  } catch (err) {
    console.error("❌ Échec envoi:", err.message);
    process.exit(1);
  }
}

main();
