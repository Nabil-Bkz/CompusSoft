# CampusSoft Backend - API NestJS

API REST pour la gestion des logiciels pédagogiques - CampusSoft

## Architecture

- **Framework**: NestJS 10+
- **Base de données**: PostgreSQL (Render)
- **ORM**: TypeORM
- **Architecture**: DDD (Domain-Driven Design) avec modules NestJS

## Installation

```bash
npm install
```

## Configuration

Le fichier `.env` doit contenir les credentials PostgreSQL (voir `.env.example`).

## Démarrage

```bash
# Développement
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Documentation API

Une fois l'application démarrée, la documentation Swagger est disponible sur :
- http://localhost:3000/api/docs

## Structure du projet

```
src/
├── common/              # Code partagé (Value Objects, Exceptions)
├── config/              # Configuration (DB, app)
├── database/            # Entités TypeORM, migrations, seeds
├── modules/             # Modules DDD (un module par Aggregate Root)
└── main.ts              # Point d'entrée
```

## Modules (par ordre d'implémentation)

1. ✅ **Common** - Value Objects et exceptions
2. ⏳ **Infrastructure** - Départements et Salles
3. ⏳ **Software Catalog** - Catalogue logiciels
4. ⏳ **User Management** - Utilisateurs et rôles
5. ⏳ **Request Management** - Demandes d'installation
6. ⏳ **Attestation** - Réattestation annuelle
7. ⏳ **History** - Historique et traçabilité

## Tests

```bash
# Tests unitaires
npm test

# Tests avec couverture
npm run test:cov

# Tests E2E
npm run test:e2e
```

## Migrations

```bash
# Générer une migration
npm run migration:generate -- -n MigrationName

# Exécuter les migrations
npm run migration:run

# Revenir en arrière
npm run migration:revert
```

