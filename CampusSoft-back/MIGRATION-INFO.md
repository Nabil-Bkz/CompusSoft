# Migration de la base de données - CampusSoft

## Problème rencontré

Les tables n'existent pas encore dans PostgreSQL. L'erreur était :
```
QueryFailedError: relation "utilisateurs" does not exist
```

## Solution appliquée

### 1. Fichier `.env` créé

Le fichier `.env` a été créé avec la configuration suivante :

```env
# Database Configuration
DB_HOST=dpg-d4gcvjp5pdvs73dth3b0-a.oregon-postgres.render.com
DB_PORT=5432
DB_USERNAME=compussoft_user
DB_PASSWORD=4PvK1LWif0JArzCcWCCpu7MKGTlgZWBF
DB_DATABASE=compussoft
DB_URL=postgresql://compussoft_user:4PvK1LWif0JArzCcWCCpu7MKGTlgZWBF@dpg-d4gcvjp5pdvs73dth3b0-a.oregon-postgres.render.com/compussoft

# App Configuration
PORT=3000
NODE_ENV=development
```

### 2. Synchronisation automatique activée

TypeORM est configuré pour synchroniser automatiquement les tables en développement :
- `synchronize: true` quand `NODE_ENV=development`
- Les tables seront créées automatiquement au démarrage de l'application

## Création des tables

Au démarrage de l'application avec `npm run start:dev`, TypeORM va créer automatiquement toutes les tables suivantes :

### Tables Infrastructure
- `departements` (id, nom, code, description, date_creation)
- `salles` (id, nom, capacite, type, localisation, description, departement_id, date_creation)

### Tables Software Catalog
- `logiciels` (id, nom, editeur, version, usage, description, duree_max, licence, date_ajout, actif)

### Tables User Management
- `utilisateurs` (id, email, nom, prenom, sso_id, role, date_creation, actif)
- `enseignants` (id, utilisateur_id, numero_employe, bureau)
- `service_informatique` (id, utilisateur_id)
- `administrateurs` (id, utilisateur_id)

## Prochaines étapes

1. **Démarrer l'application** : `npm run start:dev`
2. **Vérifier les tables** : Les tables seront créées automatiquement au premier démarrage
3. **Créer des migrations** (pour production) : Une fois les tables créées et validées, créer des migrations TypeORM pour la production

## Notes importantes

⚠️ **ATTENTION** : 
- Le fichier `.env` contient des credentials sensibles et ne doit **JAMAIS** être commité dans Git
- Le fichier `.env` est déjà dans `.gitignore`
- Pour la production, utiliser des variables d'environnement sécurisées et désactiver `synchronize`
- Utiliser des migrations TypeORM en production au lieu de la synchronisation automatique

## Commandes utiles

```bash
# Démarrer l'application (créera les tables automatiquement)
npm run start:dev

# Générer une migration après modification des entités
npm run migration:generate -- -n MigrationName

# Exécuter les migrations
npm run migration:run

# Revenir en arrière (revert)
npm run migration:revert
```

