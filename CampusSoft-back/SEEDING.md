# Seeding de la base de données - CampusSoft

## Description

Système de seeding pour alimenter la base de données avec des données de test pour tous les modules implémentés.

## Données de seed

### Départements (5 départements)
- **Informatique** (INFO)
- **Électronique** (ELEC)
- **Génie Civil** (GC)
- **Mécanique** (MECA)
- **Gestion** (GEST)

### Salles (13 salles)
- **10 salles de département** réparties dans les différents départements
- **3 salles mutualisées** (amphithéâtres et salles polyvalentes)

### Logiciels (10 logiciels)
- Visual Studio Code
- MATLAB
- AutoCAD
- SolidWorks
- Python
- IntelliJ IDEA
- Oracle VirtualBox
- Git
- MySQL Workbench
- SPSS Statistics

### Utilisateurs (7 utilisateurs)
- **4 Enseignants** :
  - Ahmed Benali (EMP001)
  - Fatima Aloui (EMP002)
  - Mohammed Tazi (EMP003)
  - Sanae Idrissi (EMP004)
- **2 Service Informatique** :
  - IT Support
  - IT Admin
- **1 Administrateur** :
  - System Administrator

## Exécution des seeds

### Méthode 1 : Script npm (Recommandé)

```bash
npm run seed
```

### Méthode 2 : Script TypeScript direct

```bash
npx ts-node -r tsconfig-paths/register src/database/seeds/seed.ts
```

### Méthode 3 : Via l'application (Service)

Le service `SeederService` peut être intégré dans l'application pour exécuter les seeds automatiquement au démarrage (voir `seeder.service.ts`).

**Note** : Pour activer le seeding automatique, décommenter le code dans `seeder.service.ts` et ajouter `RUN_SEEDS=true` dans `.env`.

## Structure des fichiers

```
src/database/seeds/
├── index.ts                 # Fonction principale runSeeds()
├── seed.ts                  # Script standalone de seeding
├── seeder.service.ts        # Service NestJS (optionnel)
├── departements.seed.ts     # Seed départements
├── salles.seed.ts          # Seed salles
├── logiciels.seed.ts       # Seed logiciels
└── utilisateurs.seed.ts    # Seed utilisateurs (avec entités spécialisées)
```

## Comportement

- **Idempotent** : Les seeds vérifient si les données existent avant de les créer
- **Sécurisé** : N'écrase pas les données existantes
- **Ordonné** : Respecte les dépendances entre entités (départements → salles, utilisateurs → enseignants)

## Ordre d'exécution

Les seeds sont exécutés dans l'ordre suivant pour respecter les dépendances :

1. **Départements** (pas de dépendances)
2. **Salles** (dépend de Départements)
3. **Logiciels** (pas de dépendances)
4. **Utilisateurs** (pas de dépendances, mais crée aussi les entités spécialisées)

## Exemple de sortie

```
🌱 Début du seeding de la base de données...

📦 Seeding des départements...
✅ Département créé: Informatique (INFO)
✅ Département créé: Électronique (ELEC)
✅ Département créé: Génie Civil (GC)
✅ Département créé: Mécanique (MECA)
✅ Département créé: Gestion (GEST)

🏢 Seeding des salles...
✅ Salle créée: A101 (département)
✅ Salle créée: A102 (département)
...

💻 Seeding des logiciels...
✅ Logiciel créé: Visual Studio Code v1.85.0
✅ Logiciel créé: MATLAB v2024.1.0
...

👥 Seeding des utilisateurs...
✅ Utilisateur créé: Ahmed Benali (ahmed.benali@university.edu)
✅ Enseignant créé: Ahmed Benali (EMP001)
...

✅ Seeding terminé avec succès!
```

## Personnalisation

Pour ajouter/modifier les données de seed :

1. Modifier les fichiers de seed correspondants dans `src/database/seeds/`
2. Ajouter vos données dans les tableaux `departements`, `salles`, `logiciels`, etc.
3. Exécuter à nouveau `npm run seed`

## Sécurité

⚠️ **ATTENTION** :
- Les seeds contiennent des données de test
- Ne jamais exécuter les seeds en production avec des données réelles
- Les credentials des utilisateurs de seed sont à des fins de test uniquement

## Prochaines étapes

Après l'exécution des seeds, vous pouvez :

1. Tester les endpoints API avec les données de seed
2. Vérifier les relations entre entités
3. Tester les fonctionnalités de l'application

## Commandes utiles

```bash
# Exécuter les seeds
npm run seed

# Vérifier les données dans la base
# (via pgAdmin, psql, ou votre outil préféré)

# Réexécuter les seeds (idempotent, ne duplique pas)
npm run seed
```

