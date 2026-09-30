# ELS STAGE

Plateforme complète de demandes de stages en ligne, créée par **Salvador**.

## Fonctionnalités

- Accueil public ELS STAGE
- Inscription / connexion
- Espace candidat
- Profil candidat
- Création et suivi de demandes de stage
- Upload CV et lettre de motivation
- Statuts : EN_ATTENTE, EN_ETUDE, ACCEPTEE, REFUSEE
- Espace administrateur
- Gestion des candidats
- Gestion des demandes
- Journalisation de base
- SQLite pour démarrer immédiatement
- Architecture prête pour PostgreSQL
- API REST séparée du frontend
- Sécurité : Helmet, JWT en cookie HttpOnly, bcrypt, validation et limite de fichiers

## Installation

1. Installer Node.js LTS.
2. Ouvrir le dossier dans VS Code.
3. Dans le terminal :

```bash
npm install
```

4. Copier `.env.example` vers `.env`.
5. Modifier au minimum `JWT_SECRET` et `ADMIN_PASSWORD`.
6. Lancer :

```bash
npm start
```

7. Ouvrir :

`http://localhost:3000`

## Compte administrateur

Les valeurs viennent de `.env` :

- Email : `ADMIN_EMAIL`
- Mot de passe : `ADMIN_PASSWORD`

Change-les avant toute mise en ligne.

## Passer à PostgreSQL

1. Créer une base PostgreSQL.
2. Dans `.env` :

```env
DATABASE_MODE=postgres
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/els_stage
```

3. Redémarrer :

```bash
npm start
```

Le serveur crée automatiquement les tables.

## Mise en production

- Utiliser HTTPS.
- Mettre un `JWT_SECRET` long et aléatoire.
- Utiliser PostgreSQL.
- Mettre les documents dans un stockage privé adapté plutôt que dans le serveur web.
- Ne jamais publier `.env`.
- Faire des sauvegardes de la base.
- Ajouter un nom de domaine et un reverse proxy.
- Configurer les variables d'environnement du serveur.

## Auteur

**Salvador — ELS STAGE**
