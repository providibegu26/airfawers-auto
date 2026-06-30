const nodemailer = require("nodemailer");

const BREVO_API_URL = "https://api.brevo.com/v3";

function getBrevoApiKey() {
  return (process.env.BREVO_API_KEY || "").trim();
}

function getEmailFrom() {
  return (process.env.EMAIL_FROM || process.env.EMAIL_USER || "").trim();
}

function getEmailFromName() {
  return (process.env.EMAIL_FROM_NAME || "Airfawers Auto").trim();
}

function getEmailPassword() {
  const raw = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || "";
  return raw.replace(/\s/g, "");
}

function getEmailUser() {
  return (process.env.EMAIL_USER || "").trim();
}

function getEmailProvider() {
  if (getBrevoApiKey()) return "brevo";
  if (getEmailUser() && getEmailPassword()) return "smtp";
  return null;
}

function isEmailConfigured() {
  return getEmailProvider() !== null;
}

function createSmtpTransporter() {
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

async function verifyBrevo() {
  const apiKey = getBrevoApiKey();
  if (!apiKey) {
    return { ok: false, error: "BREVO_API_KEY manquant" };
  }
  if (!getEmailFrom()) {
    return { ok: false, error: "EMAIL_FROM (ou EMAIL_USER) manquant" };
  }

  try {
    const response = await fetch(`${BREVO_API_URL}/account`, {
      headers: { "api-key": apiKey },
    });
    if (!response.ok) {
      const body = await response.text();
      return {
        ok: false,
        error: `Brevo API ${response.status}: ${body.slice(0, 200)}`,
      };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function verifySmtp() {
  if (!getEmailUser() || !getEmailPassword()) {
    return { ok: false, error: "EMAIL_USER ou EMAIL_PASSWORD/EMAIL_PASS manquant" };
  }
  try {
    await createSmtpTransporter().verify();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function verifyEmail() {
  const provider = getEmailProvider();
  if (!provider) {
    return {
      ok: false,
      error:
        "Email non configuré : définissez BREVO_API_KEY + EMAIL_FROM (production) ou EMAIL_USER + EMAIL_PASS (local).",
    };
  }
  if (provider === "brevo") return verifyBrevo();
  return verifySmtp();
}

async function sendViaBrevo({ to, subject, html, text }) {
  const apiKey = getBrevoApiKey();
  const from = getEmailFrom();

  if (!apiKey) {
    const err = new Error("BREVO_API_KEY manquant sur le serveur.");
    err.code = "EMAIL_NOT_CONFIGURED";
    throw err;
  }
  if (!from) {
    const err = new Error("EMAIL_FROM (ou EMAIL_USER) manquant sur le serveur.");
    err.code = "EMAIL_NOT_CONFIGURED";
    throw err;
  }

  const payload = {
    sender: { name: getEmailFromName(), email: from },
    to: [{ email: to }],
    subject,
  };
  if (html) payload.htmlContent = html;
  if (text) payload.textContent = text;
  if (!html && !text) payload.textContent = subject;

  const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    const err = new Error(`Brevo: ${response.status} — ${body.slice(0, 300)}`);
    err.code = "BREVO_SEND_FAILED";
    throw err;
  }

  return response.json();
}

async function sendViaSmtp(mailOptions) {
  if (!getEmailUser() || !getEmailPassword()) {
    const err = new Error(
      "Configuration SMTP manquante : EMAIL_USER et EMAIL_PASSWORD (ou EMAIL_PASS)."
    );
    err.code = "EMAIL_NOT_CONFIGURED";
    throw err;
  }
  return createSmtpTransporter().sendMail({
    from: getEmailUser(),
    ...mailOptions,
  });
}

/**
 * Envoie un email via Brevo (prod) ou SMTP Gmail (dev local).
 * @param {{ to: string, subject: string, html?: string, text?: string }} mailOptions
 */
async function sendMail(mailOptions) {
  const { to, subject, html, text } = mailOptions;
  const provider = getEmailProvider();

  if (!provider) {
    const err = new Error(
      "Email non configuré : BREVO_API_KEY + EMAIL_FROM sur Railway, ou EMAIL_USER + EMAIL_PASS en local."
    );
    err.code = "EMAIL_NOT_CONFIGURED";
    throw err;
  }

  if (provider === "brevo") {
    return sendViaBrevo({ to, subject, html, text });
  }
  return sendViaSmtp({ to, subject, html, text });
}

module.exports = {
  sendMail,
  verifyEmail,
  verifySmtp,
  verifyBrevo,
  isEmailConfigured,
  getEmailProvider,
  getEmailFrom,
  getEmailUser,
};
