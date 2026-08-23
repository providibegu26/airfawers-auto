/**
 * Retourne un objet admin sans le hash password.
 */
function sanitizeAdmin(admin) {
  if (!admin) return null;
  const { password, ...safe } = admin;
  return safe;
}

module.exports = { sanitizeAdmin };
