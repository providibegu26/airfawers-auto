const { getFrontendBaseUrl } = require('../config/appUrls');

function formatDateFr(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function buildMaintenancePlannedEmailText({ prenom, nom, immatriculation, typeLabel, datePrevue }) {
  const calendarUrl = `${getFrontendBaseUrl()}/chauffeur/calendrier`;

  return [
    `Bonjour ${prenom} ${nom},`,
    '',
    `Un entretien a été planifié pour votre véhicule ${immatriculation}.`,
    '',
    `Type : ${typeLabel}`,
    `Date prévue : ${formatDateFr(datePrevue)}`,
    '',
    `Consultez votre calendrier : ${calendarUrl}`,
    '',
    'Cordialement,',
    "L'équipe Airfawers Auto",
  ].join('\n');
}

function buildMaintenancePlannedEmailHtml({ prenom, nom, immatriculation, typeLabel, datePrevue }) {
  const calendarUrl = `${getFrontendBaseUrl()}/chauffeur/calendrier`;
  const dateLabel = formatDateFr(datePrevue);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Entretien planifié</h2>
      <p>Bonjour ${prenom} ${nom},</p>
      <p>Un entretien a été planifié pour votre véhicule <strong>${immatriculation}</strong>.</p>

      <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
        <p style="margin: 5px 0;"><strong>Type :</strong> ${typeLabel}</p>
        <p style="margin: 5px 0;"><strong>Date prévue :</strong> ${dateLabel}</p>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${calendarUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Voir mon calendrier
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">Cordialement,<br>L'équipe Airfawers Auto</p>
    </div>
  `;
}

module.exports = {
  buildMaintenancePlannedEmailHtml,
  buildMaintenancePlannedEmailText,
};
