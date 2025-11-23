import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { runSeeds } from './index';

/**
 * Service de seeding automatique (optionnel)
 * Peut être activé au démarrage de l'application
 */
@Injectable()
export class SeederService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    // Optionnel: Exécuter automatiquement les seeds au démarrage
    // Décommenter pour activer (attention en production!)
    /*
    const shouldRunSeeds = process.env.RUN_SEEDS === 'true';
    if (shouldRunSeeds) {
      console.log('🌱 Exécution automatique des seeds...');
      await runSeeds(this.dataSource);
    }
    */
  }

  /**
   * Exécuter les seeds manuellement
   */
  async seed(): Promise<void> {
    await runSeeds(this.dataSource);
  }
}

