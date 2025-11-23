import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

/**
 * Script de seeding standalone
 * Usage: npx ts-node src/database/seeds/seed.ts
 */
async function bootstrap() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'dpg-d4gcvjp5pdvs73dth3b0-a.oregon-postgres.render.com',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'compussoft_user',
    password: process.env.DB_PASSWORD || '4PvK1LWif0JArzCcWCCpu7MKGTlgZWBF',
    database: process.env.DB_DATABASE || 'compussoft',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: false, // Pas de synchronisation pour le seed
    logging: true,
    ssl: {
      rejectUnauthorized: false, // Pour Render PostgreSQL
    },
  });

  try {
    await dataSource.initialize();
    console.log('✅ Connexion à la base de données établie\n');

    // Importer et exécuter les seeds
    const { runSeeds } = await import('./index');
    await runSeeds(dataSource);

    await dataSource.destroy();
    console.log('\n✅ Connexion fermée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

bootstrap();

