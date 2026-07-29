# Sécurité P0 — Auth admin

## JWT_SECRET
Obligatoire au démarrage du backend (dev + prod). Minimum 16 caractères ; les valeurs d’exemple (`change_me`, `secret`, etc.) sont refusées.

```bash
# Générer une clé
openssl rand -hex 32
# Puis dans backend/.env :
JWT_SECRET=<clé générée>
```

## Créer le premier admin (CLI uniquement)
Aucun endpoint public de création admin.

```bash
cd backend
npx prisma migrate deploy   # réintroduit la table Admin si besoin
npm run create-admin -- --email admin@exemple.com --password "MotDePasseFort8+"
# ou :
# ADMIN_EMAIL=admin@exemple.com ADMIN_PASSWORD=MotDePasseFort8+ npm run create-admin
```

Ensuite : connexion UI sur `/admin/login` → `POST /api/admin/auth/login`.

## Déploiement
1. Définir `JWT_SECRET` fort sur Railway / l’environnement cible  
2. Déployer les migrations (`prisma migrate deploy`)  
3. Exécuter `create-admin` une fois  
4. Vérifier qu’un `GET /api/admin/vehicules` sans token renvoie **401**
