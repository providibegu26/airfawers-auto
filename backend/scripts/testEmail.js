require("dotenv").config();
const { sendMail, isEmailConfigured, getEmailUser } = require("../src/config/email");

async function main() {
  const testTo = process.argv[2] || getEmailUser();

  console.log("EMAIL configuré:", isEmailConfigured());
  console.log("EMAIL_USER:", getEmailUser() ? `${getEmailUser().slice(0, 3)}***` : "(vide)");

  if (!isEmailConfigured()) {
    console.error("❌ EMAIL_USER ou EMAIL_PASSWORD/EMAIL_PASS manquant.");
    process.exit(1);
  }

  try {
    await sendMail({
      to: testTo,
      subject: "Test SMTP Airfawers Auto",
      text: "Si vous recevez cet email, la configuration SMTP fonctionne.",
    });
    console.log("✅ Email de test envoyé à:", testTo);
  } catch (err) {
    console.error("❌ Échec envoi:", err.message);
    if (err.code) console.error("   code:", err.code);
    if (err.response) console.error("   réponse SMTP:", err.response);
    process.exit(1);
  }
}

main();
