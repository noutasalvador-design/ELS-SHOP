# ELS SHOP MARKETPLACE

Marketplace multi-vendeurs pour découvrir, acheter et vendre des produits physiques et numériques sur plusieurs marchés africains.

## Stack technique
- Next.js + TypeScript
- Tailwind CSS
- PostgreSQL (Neon) + Prisma
- CinetPay comme fournisseur de paiement à intégrer et valider
- Déploiement prévu sur Vercel

## Démarrage local
1. Installer Node.js 20 ou supérieur.
2. Installer les dépendances avec `npm install`.
3. Copier `.env.example` vers `.env` et renseigner `DATABASE_URL`.
4. Préparer la base : `npm run db:push`.
5. Lancer le projet : `npm run dev`.
6. Ouvrir `http://localhost:3000`.

## Variables d'environnement
Voir `.env.example`. Ne jamais publier les fichiers `.env` ni exposer des secrets dans des variables `NEXT_PUBLIC_*`.

## Déploiement Vercel
1. Importer ce dépôt GitHub dans Vercel.
2. Définir les variables d'environnement dans les réglages Vercel.
3. Utiliser une base PostgreSQL Neon avec SSL.
4. Déployer et vérifier `/api/health`.
5. Exécuter les migrations de base de données selon le workflow de déploiement retenu.

## Paiements
L'adaptateur CinetPay est préparé côté serveur, mais **les paiements réels ne sont pas activés dans ce socle**. Il faut implémenter et tester l'initialisation, la notification serveur, la vérification de référence/montant/devise et l'idempotence avec les identifiants marchands de chaque pays avant d'accepter des paiements.

## État des fonctionnalités
La vitrine actuelle est une première interface avec produits de démonstration. Les comptes, boutiques connectées, commandes réelles, fichiers numériques protégés et l'administration restent à développer. Voir [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Licence
Tous droits réservés — ELS SHOP MARKETPLACE.
