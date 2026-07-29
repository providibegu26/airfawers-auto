const WEAK_SECRETS = new Set([
  'secret',
  'your-secret-key',
  'change_me',
  'change-me',
  'change-me-in-production',
  'jwt_secret',
  'jwt-secret',
]);

const MIN_LENGTH = 16;

/**
 * Valide JWT_SECRET au démarrage. Crash si absent ou trop faible.
 * @returns {string} secret validé
 */
function assertJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || String(secret).trim() === '') {
    console.error(
      '❌ JWT_SECRET est obligatoire. Définissez une clé longue et aléatoire dans backend/.env (voir .env.example).'
    );
    process.exit(1);
  }

  const value = String(secret).trim();

  if (value.length < MIN_LENGTH) {
    console.error(
      `❌ JWT_SECRET trop court (${value.length} caractères). Minimum requis : ${MIN_LENGTH}.`
    );
    process.exit(1);
  }

  if (WEAK_SECRETS.has(value.toLowerCase())) {
    console.error(
      '❌ JWT_SECRET trop faible (valeur d\'exemple interdite). Générez une clé aléatoire, ex. : openssl rand -hex 32'
    );
    process.exit(1);
  }

  return value;
}

module.exports = { assertJwtSecret, MIN_LENGTH };
