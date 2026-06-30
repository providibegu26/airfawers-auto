const nodemailer = require("nodemailer");

function getEmailPassword() {
  return process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || "";
}

function getEmailUser() {
  return process.env.EMAIL_USER || "";
}

function isEmailConfigured() {
  return Boolean(getEmailUser() && getEmailPassword());
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    get user() {
      return getEmailUser() || "airfawersauto@gmail.com";
    },
    get pass() {
      return getEmailPassword() || "your-app-password";
    },
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function sendMail(mailOptions) {
  if (!isEmailConfigured()) {
    const err = new Error(
      "Configuration SMTP manquante : définissez EMAIL_USER et EMAIL_PASSWORD (ou EMAIL_PASS) sur Railway."
    );
    err.code = "EMAIL_NOT_CONFIGURED";
    throw err;
  }
  return transporter.sendMail({
    from: getEmailUser(),
    ...mailOptions,
  });
}

module.exports = {
  transporter,
  sendMail,
  isEmailConfigured,
  getEmailUser,
};
