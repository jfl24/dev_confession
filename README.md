# Dev Confession (En développement)

### Réseau social pour développeurs où les usagers peuvent partager leurs problèmes du quotidien, réagir aux posts des autres et les commenter. Inclut une authentification avec Clerk.

![images/Capture_d’écran_2026-09-27_215034.png](images/Capture_d’écran_2026-09-27_215034.png)
![images/Capture_d’écran_2026-09-27_214802.png](images/Capture_d’écran_2026-09-27_214802.png)

## Fonctionnalités :
- Gestion des données : Création, lecture, mise à jour et suppression (CRUD) des Confessions, des Réactions, des Commentaires, des Reports et éventuellement, des Paiements
- Utilisation des Composants React (client et serveur) et des Server Actions pour des mutations sécurisées côté serveur sans API REST manuelle
- Persistance des données : Schéma relationnel géré via Prisma pour une base PostgreSQL hébergée sur Néon
- Partage des Confessions sur la plateforme X


## Stack technologique :
- Framework Full-stack : Next.js 14+
- Frontend : React, TypeScript, Tailwind CSS
- Base de données et ORM : PostgreSQL (Neon), Prisma ORM
- Authentification : Clerk

## Installation et exécution locale :
### Prérequis:
- Node.js(version 18 ou supérieure)
- Un gestionnaire de paquets (npm, pnpm ou yarn)

### Étapes:
#### 1. Cloner le dépôt:
```bash
git clone https://github.com/jfl24/dev_confession.git
cd dev_confession
```

#### 2. Installer les dépendances
```bash
npm install
```

#### 3. Configurer les variables d'environnement:
#### Créez un fichier .env ou .env.local à la racine du projet sur le modèle suivant :
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=a_implanter
CLERK_SECRET_KEY=a_implanter
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

#### 4. Synchroniser la base de données:
```bash
npx prisma generate
npx prisma db push
```

#### 5. Lancer le serveur de développement
```bash
npm run dev
```
#### Ouvrez http://localhost:3000 dans votre navigateur pour voir le résultat

## Auteur :
GitHub: @jfl24

