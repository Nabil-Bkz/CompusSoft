import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Demande } from './entities/demande.entity';
import { DemandeLogiciel } from './entities/demande-logiciel.entity';
import { DemandeLogicielSalle } from './entities/demande-logiciel-salle.entity';
import { DemandeService } from './services/demande.service';
import { InstallationService } from './services/installation.service';
import { InstallationSyncService } from './services/installation-sync.service';
import { DemandeController } from './controllers/demande.controller';
import { InstallationController } from './controllers/installation.controller';
// Import des entités des autres modules pour les relations
import { Logiciel } from '../software-catalog/entities/logiciel.entity';
import { Salle } from '../infrastructure/entities/salle.entity';
import { Utilisateur } from '../user-management/entities/utilisateur.entity';
// Import HistoryModule pour l'historique automatique
import { HistoryModule } from '../history/history.module';

/**
 * Module Request Management
 * Gère le workflow complet des demandes d'installation
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Demande,
      DemandeLogiciel,
      DemandeLogicielSalle,
      Logiciel,
      Salle,
      Utilisateur,
    ]),
    forwardRef(() => HistoryModule), // Permet l'injection de HistoriqueService avec forwardRef
  ],
  controllers: [DemandeController, InstallationController],
  providers: [
    DemandeService,
    InstallationService,
    InstallationSyncService,
  ],
  exports: [
    DemandeService,
    InstallationService,
    InstallationSyncService,
    TypeOrmModule,
  ],
})
export class RequestManagementModule {}

