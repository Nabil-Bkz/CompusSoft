import { Injectable, Logger } from '@nestjs/common';
// Note: @nestjs/schedule n'est pas installé. Pour activer les jobs automatiques:
// 1. Installer: npm install @nestjs/schedule
// 2. Importer ScheduleModule dans AppModule
// 3. Décommenter les imports et décorateurs @Cron ci-dessous
// import { Cron, CronExpression } from '@nestjs/schedule';
import { AttestationService } from '../services/attestation.service';

/**
 * Service pour les tâches automatiques (Jobs/Cron) liées aux attestations
 * 
 * ⚠️ Pour activer les jobs automatiques:
 * 1. Installer: npm install @nestjs/schedule
 * 2. Importer ScheduleModule dans AppModule: imports: [ScheduleModule.forRoot(), ...]
 * 3. Décommenter les décorateurs @Cron dans les méthodes
 * 
 * Les endpoints suivants peuvent aussi être appelés manuellement ou via Cron externe:
 * - POST /api/attestations/expirer-dues
 * - GET /api/attestations/rappel
 */
@Injectable()
export class AttestationJobsService {
  private readonly logger = new Logger(AttestationJobsService.name);

  constructor(private readonly attestationService: AttestationService) {}

  /**
   * Expire automatiquement les attestations dues
   * Exécuté quotidiennement à minuit
   * 
   * Pour activer: Décommenter @Cron après installation de @nestjs/schedule
   */
  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpirerAttestationsDuues() {
    this.logger.log('Exécution du job: Expiration attestations dues');
    try {
      const count = await this.attestationService.expirerAttestationsDuues();
      this.logger.log(`${count} attestation(s) expirée(s)`);
      return count;
    } catch (error) {
      this.logger.error('Erreur lors de l\'expiration des attestations:', error);
      throw error;
    }
  }

  /**
   * Affiche les attestations nécessitant un rappel
   * Exécuté quotidiennement à 8h
   * 
   * Pour activer: Décommenter @Cron après installation de @nestjs/schedule
   */
  // @Cron('0 8 * * *') // Tous les jours à 8h
  async handleVerifierRappels(joursAvantExpiration: number = 30) {
    this.logger.log('Exécution du job: Vérification rappels attestations');
    try {
      const attestations = await this.attestationService.findAttestationsPourRappel(joursAvantExpiration);
      if (attestations.length > 0) {
        this.logger.warn(`${attestations.length} attestation(s) nécessite(nt) un rappel`);
        // TODO: Envoyer notifications (email, etc.)
      }
      return attestations;
    } catch (error) {
      this.logger.error('Erreur lors de la vérification des rappels:', error);
      throw error;
    }
  }
}

