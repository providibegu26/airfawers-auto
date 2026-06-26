# 🔐 Configuration Email pour le Changement de Mot de Passe

## 📧 Configuration Gmail

### 1. Activer l'authentification à 2 facteurs
- Allez sur votre compte Google
- Sécurité → Authentification à 2 facteurs → Activer

### 2. Générer un mot de passe d'application
- Sécurité → Mots de passe d'application
- Sélectionnez "Application" → "Autre (nom personnalisé)"
- Entrez "Airfawers Auto" et générez

### 3. Configurer les variables d'environnement
Créez un fichier `.env` dans le dossier `backend` avec :

```env
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-d-application
```

## 🚀 Test de l'API

### 1. Redémarrer le serveur
```bash
npm run dev
```

### 2. Tester l'envoi d'email
```bash
curl -X POST http://localhost:4000/api/auth/chauffeur/password-change/request \
  -H "Content-Type: application/json" \
  -d '{"email":"chauffeur@example.com"}'
```

## 🔒 Sécurité

- Le code expire dans 15 minutes
- Chaque code ne peut être utilisé qu'une fois
- Les anciens codes sont automatiquement supprimés
- Le nouveau mot de passe est hashé avec bcrypt

## 📱 Interface Utilisateur

1. **Étape 1** : Le chauffeur entre son email
2. **Étape 2** : Un code est envoyé par email
3. **Étape 3** : Le chauffeur entre le code + nouveau mot de passe
4. **Confirmation** : Redirection vers la page de connexion



