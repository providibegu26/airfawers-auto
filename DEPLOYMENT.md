# Déploiement — Airfawers Auto

Stack cible : **Vercel** (frontend) + **Railway** (backend Express + PostgreSQL).

---

## Prérequis

- Compte [GitHub](https://github.com) avec le code poussé sur un dépôt
- Compte [Railway](https://railway.app)
- Compte [Vercel](https://vercel.com)

---

## Partie 1 — Railway (backend + base de données)

### 1. Créer le projet Railway

1. Connectez-vous à Railway → **New Project**
2. Choisissez **Deploy from GitHub repo** et sélectionnez ce dépôt
3. Railway détecte le repo : configurez le **Root Directory** sur :
   ```
   backend
   ```

### 2. Ajouter PostgreSQL

1. Dans le projet Railway → **+ New** → **Database** → **PostgreSQL**
2. Railway crée automatiquement la variable `DATABASE_URL` sur le service backend (via **Variables** → **Reference** si besoin)

### 3. Variables d'environnement (service backend)

Dans **backend** → **Variables**, ajoutez :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | Référence au plugin Postgres (auto) |
| `JWT_SECRET` | Clé longue aléatoire (ex. `openssl rand -base64 48`) |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | URL Vercel (voir étape 2 ci-dessous) — ex. `https://airfawers-auto.vercel.app` |
| `EMAIL_USER` | Votre email SMTP (Gmail, etc.) |
| `EMAIL_PASS` ou `EMAIL_PASSWORD` | Mot de passe d'application email |

> `PORT` et `HOST` sont gérés par Railway — ne les forcez pas sauf besoin spécifique.

### 4. Déployer le backend

Railway lance automatiquement :
```bash
npm install
prisma generate
prisma migrate deploy && node server.js
```

### 5. Vérifier que l'API fonctionne

Ouvrez dans le navigateur (remplacez par votre URL Railway) :
```
https://VOTRE-BACKEND.up.railway.app/api/health
```
Réponse attendue : `{"ok":true,"service":"airfawers-auto-api"}`

**Copiez l'URL publique du backend** (sans `/api` à la fin), ex. :
```
https://airfawers-backend-production.up.railway.app
```

---

## Partie 2 — Vercel (frontend)

### 1. Importer le projet

1. [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Importez le même dépôt GitHub
3. Configurez :
   - **Root Directory** : `frontend`
   - **Framework Preset** : Vite
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`

### 2. Variable d'environnement Vercel

Dans **Settings** → **Environment Variables**, ajoutez :

| Nom | Valeur | Environnements |
|-----|--------|----------------|
| `VITE_API_URL` | URL Railway **sans slash final** | Production, Preview, Development |

Exemple :
```
VITE_API_URL=https://airfawers-backend-production.up.railway.app
```

> ⚠️ `VITE_*` est injecté **au moment du build**. Après modification, **redéployez** le frontend.

### 3. Déployer

Cliquez **Deploy**. Vercel vous donne une URL, ex. :
```
https://airfawers-auto.vercel.app
```

### 4. Finaliser le CORS sur Railway

Retournez sur Railway → variables du backend → mettez à jour :
```
CORS_ORIGIN=https://airfawers-auto.vercel.app
```
(Si vous avez un domaine custom, ajoutez-le séparé par une virgule.)

Redéployez le backend si nécessaire.

---

## Partie 3 — Premier compte admin

Après le premier déploiement, la base est vide. Créez un admin :

**Option A** — Script local pointant vers la DB Railway :
```bash
cd backend
# Copiez DATABASE_URL de Railway dans un fichier .env local
npx prisma studio
```
Puis créez un utilisateur via l'interface Prisma ou un script existant.

**Option B** — Utilisez les scripts de seed/test du projet si disponibles.

---

## Développement local (inchangé)

```bash
# Terminal 1 — backend
cd backend
cp env.example .env   # puis éditez DATABASE_URL, JWT_SECRET
npm install
npx prisma migrate dev
npm run dev

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Le frontend utilise `http://localhost:4000` par défaut (pas besoin de `.env` en local).

---

## Checklist avant mise en ligne

- [ ] `JWT_SECRET` fort en production (pas la valeur par défaut)
- [ ] `CORS_ORIGIN` = URL exacte du frontend Vercel
- [ ] `VITE_API_URL` = URL exacte du backend Railway
- [ ] `/api/health` répond `ok: true`
- [ ] Login admin fonctionne
- [ ] Login chauffeur fonctionne (mobile)
- [ ] Migrations Prisma appliquées sans erreur dans les logs Railway

---

## Dépannage

| Problème | Cause probable | Solution |
|----------|----------------|----------|
| Erreur CORS dans la console | `CORS_ORIGIN` incorrect | Mettre l'URL Vercel exacte (avec `https://`) |
| API introuvable (404) | `VITE_API_URL` mal configuré | Vérifier l'URL Railway, redéployer Vercel |
| `JWT_SECRET` / token invalide | Secret différent entre déploiements | Fixer un secret stable sur Railway |
| Erreur Prisma au démarrage | `DATABASE_URL` manquante | Lier le plugin Postgres au service backend |
| Page blanche après refresh | Routing SPA | `vercel.json` déjà configuré — vérifier le root `frontend` |

---

## Domaine personnalisé (optionnel)

- **Vercel** : Settings → Domains → ajoutez `app.votredomaine.com`
- **Railway** : Settings → Networking → Custom Domain → `api.votredomaine.com`
- Mettez à jour `VITE_API_URL` et `CORS_ORIGIN` en conséquence
