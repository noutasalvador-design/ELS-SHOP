# ELS SHOP MARKETPLACE — architecture de départ

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- PostgreSQL (Neon recommandé) + Prisma
- CinetPay comme premier fournisseur à évaluer pour les paiements multi-pays
- Vercel pour l'hébergement web

## État initial
- Vitrine responsive de démonstration
- Schéma de données pour utilisateurs, boutiques, produits, commandes et paiements
- Adaptateur de paiement côté serveur, volontairement non activé
- Endpoint de santé pour vérifier le déploiement
- Variables d'environnement documentées sans secrets

## Règles de sécurité
1. Ne jamais exposer les clés CinetPay, secrets d'authentification ou accès DB dans des variables publiques.
2. Ne jamais considérer une redirection navigateur comme preuve de paiement : confirmer auprès du fournisseur côté serveur.
3. Créer la commande et une clé d'idempotence avant d'initialiser un paiement.
4. Vérifier la notification du fournisseur, le montant, la devise, le pays et la référence avant de marquer une commande comme payée.
5. Appliquer les autorisations côté serveur à chaque action vendeur/admin.
6. Stocker les mots de passe avec Argon2id ou bcrypt et limiter les tentatives de connexion.
7. Stocker les fichiers numériques dans un espace privé et les servir via des liens temporaires après vérification de l'achat.
8. Ne jamais accepter des prix, commissions, rôles ou montants provenant uniquement du navigateur.
9. Ajouter journaux des actions sensibles, sauvegardes et procédures de récupération.
10. Vérifier les obligations de commerce, données personnelles, fiscalité, remboursements et paiements dans chaque pays.

## Prochaines étapes
1. Connecter PostgreSQL Neon et exécuter `npm run db:push`.
2. Ajouter une authentification réelle, vérification d'e-mail et récupération de compte.
3. Remplacer les données de démonstration par le catalogue en base.
4. Construire les espaces client, vendeur et administration avec contrôles côté serveur.
5. Développer panier, commandes et calcul serveur des prix.
6. Implémenter CinetPay avec la documentation officielle et tester chaque compte marchand en sandbox.
7. Ajouter stockage privé pour médias et téléchargements numériques.
8. Ajouter tests automatisés, suivi d'erreurs, sauvegardes, politique de confidentialité et conditions de vente.

## Paiements multi-pays
La disponibilité réelle des opérateurs, devises et remboursements dépend du pays et du compte marchand. Confirmer les capacités avec le fournisseur avant d'activer un pays. Les paiements réels ne sont pas activés dans cette version de base.
