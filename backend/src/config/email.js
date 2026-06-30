const nodemailer = require("nodemailer");

function getEmailPassword() {
  const raw = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || "";
  // Gmail affiche les mots de passe d'application avec des espaces — les retirer
  return raw.replace(/\s/g, "");
}

function getEmailUser() {
  return (process.env.EMAIL_USER || "").trim();
}

function isEmailConfigured() {
  return Boolean(getEmailUser() && getEmailPassword());
}

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: getEmailUser(),
      pass: getEmailPassword(),
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

async function verifySmtp() {
  if (!isEmailConfigured()) {
    return { ok: false, error: "EMAIL_USER ou EMAIL_PASSWORD/EMAIL_PASS manquant" };
  }
  const transporter = createTransporter();
  try {
    await transporter.verify();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function sendMail(mailOptions) {
  if (!isEmailConfigured()) {
    const err = new Error(
      "Configuration SMTP manquante : définissez EMAIL_USER et EMAIL_PASSWORD (ou EMAIL_PASS) sur Railway."
    );
    err.code = "EMAIL_NOT_CONFIGURED";
    throw err;
  }
  const transporter = createTransporter();
  return transporter.sendMail({
    from: getEmailUser(),
    ...mailOptions,
  });
}

module.exports = {
  createTransporter,
  sendMail,
  verifySmtp,
  isEmailConfigured,
  getEmailUser,
};
