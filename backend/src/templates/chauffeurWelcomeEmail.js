const { getChauffeurLoginUrl } = require("../config/appUrls");

function buildChauffeurWelcomeEmailText({ prenom, nom, email, password }) {
  const loginUrl = getChauffeurLoginUrl();

  return [
    `Bonjour ${prenom} ${nom},`,
    "",
    "Votre compte chauffeur Airfawers Auto a été créé.",
    "",
    "Identifiants de connexion :",
    `Email : ${email}`,
    `Mot de passe temporaire : ${password}`,
    "",
    `Lien de connexion : ${loginUrl}`,
    "",
    "À la première connexion, vous devrez personnaliser votre mot de passe.",
    "",
    "Cordialement,",
    "L'équipe Airfawers Auto",
  ].join("\n");
}

function buildChauffeurWelcomeEmailHtml({ prenom, nom, email, password }) {
  const loginUrl = getChauffeurLoginUrl();
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Bienvenue chez Airfawers Auto !</h2>
      <p>Bonjour ${prenom} ${nom},</p>
      <p>Votre compte chauffeur a été créé avec succès par l'administrateur.</p>

      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #059669; margin: 0;">Vos identifiants de connexion</h3>
        <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #2563eb;">
          <p style="margin: 5px 0;"><strong>Email :</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Mot de passe temporaire :</strong> <span style="font-family: monospace; font-size: 16px; color: #2563eb; font-weight: bold;">${password}</span></p>
        </div>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${loginUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Accéder à mon espace chauffeur
        </a>
      </div>

      <p style="text-align: center; color: #6b7280; font-size: 13px; word-break: break-all;">
        Lien direct : <a href="${loginUrl}" style="color: #2563eb;">${loginUrl}</a>
      </p>

      <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0;">
        <p style="margin: 0; color: #92400e;"><strong>Important :</strong> À la première connexion, vous devrez personnaliser votre mot de passe.</p>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        Cordialement,<br>L'équipe Airfawers Auto
      </p>
    </div>
  `;
}

module.exports = {
  buildChauffeurWelcomeEmailHtml,
  buildChauffeurWelcomeEmailText,
};