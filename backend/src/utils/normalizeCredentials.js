function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function normalizePassword(password) {
  return String(password ?? "").trim();
}

module.exports = {
  normalizeEmail,
  normalizePassword,
};
