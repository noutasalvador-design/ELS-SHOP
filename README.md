# ELS SHOP MARKETPLACE

Marketplace multi-vendeurs pour découvrir, acheter et vendre des produits physiques et numériques sur plusieurs marchés africains.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- PostgreSQL (Neon recommandé) + Prisma
- CinetPay comme premier fournisseur de paiement à intégrer
- Vercel pour le déploiement

## Fonctionnalités déjà préparées
- Vitrine responsive et pages de connexion/inscription
- Inscription et connexion avec mots de passe hachés (bcrypt)
- Session signée dans un cookie HttpOnly, SameSite=Lax et Secure en production
- Rôles CUSTOMER, SELLER et ADMIN; le rôle courant est relu en base
- Création de boutique et endpoint de création de produits en brouillon
- Catalogue public limité aux produits actifs des boutiques actives
- Espace de modération administrateur pour vérifier les boutiques et publier les produits physiques admissibles
- Schéma PostgreSQL pour comptes, boutiques, produits, commandes et paiements
- Endpoint de santé, métadonnées SEO, sitemap et robots.txt
- Workflow GitHub Actions pour valider le schéma Prisma et compiler l’application

## Pays de lancement préparés
Bénin, Côte d’Ivoire, Sénégal, Burkina Faso, Mali, Togo, Niger, Guinée, Cameroun et RDC. La disponibilité des moyens de paiement doit être confirmée pour chaque compte marchand et chaque pays avant l'activation.

## Démarrage local
1. Installer Node.js 20 ou supérieur.
2. Installer les dépendances : `npm install`.
3. Copier `.env.example` vers `.env`.
4. Créer une base PostgreSQL, par exemple sur Neon, puis renseigner `DATABASE_URL`.
5. Générer un secret aléatoire d’au moins 32 caractères pour `AUTH_SECRET`.
6. Préparer la base : `npm run db:push`.
7. Lancer : `npm run dev`.
8. Ouvrir `http://localhost:3000`.

## Variables d'environnement
Voir `.env.example`. Ne jamais publier les fichiers `.env` ni exposer des secrets dans des variables `NEXT_PUBLIC_*`.

## Administration
Aucun formulaire public ne peut créer un compte administrateur. Le rôle ADMIN doit être attribué par un opérateur autorisé directement dans la base de données, après sécurisation de l’accès à cette base. Ensuite, la page `/administration` permet la modération.

## Paiements
L’adaptateur CinetPay est une frontière d’intégration côté serveur; le checkout réel n’est pas activé. Avant de recevoir de l’argent, il faut implémenter le flux officiel, enregistrer les commandes et paiements en base, vérifier les notifications côté serveur, vérifier montant/devise/pays/référence et rendre le traitement idempotent. Ne jamais marquer une commande payée sur la seule base d’une redirection navigateur.

Documentation officielle : https://docs.cinetpay.com/

## Limites connues du socle
- Les produits physiques et numériques sont créés en brouillon; une boutique doit être vérifiée avant publication.
- L’upload et la livraison sécurisée de fichiers numériques ne sont pas encore implémentés.
- Le panier, les commandes complètes, la livraison, les remboursements et les règlements aux vendeurs restent à développer.
- Ajouter une limitation de débit partagée, vérification d’e-mail, récupération de compte, stockage d’images, tests d’intégration, journalisation, sauvegardes et politiques légales avant l’ouverture publique.

Voir [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) pour la feuille de route.
