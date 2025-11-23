import { DataSource } from 'typeorm';
import { seedDepartements } from './departements.seed';
import { seedSalles } from './salles.seed';
import { seedLogiciels } from './logiciels.seed';
import { seedUtilisateurs } from './utilisateurs.seed';

/**
 * Fonction principale pour exécuter tous les seeds
 */
export async function runSeeds(dataSource: DataSource): Promise<void> {
  console.log('🌱 Début du seeding de la base de données...\n');

  try {
    // Vérifier la connexion
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    // Ordre important : respecter les dépendances
    console.log('📦 Seeding des départements...');
    await seedDepartements(dataSource);
    console.log('');

    console.log('🏢 Seeding des salles...');
    await seedSalles(dataSource);
    console.log('');

    console.log('💻 Seeding des logiciels...');
    await seedLogiciels(dataSource);
    console.log('');

    console.log('👥 Seeding des utilisateurs...');
    await seedUtilisateurs(dataSource);
    console.log('');

    console.log('✅ Seeding terminé avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  }
}

