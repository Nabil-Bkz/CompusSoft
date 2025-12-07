import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Historique } from './entities/historique.entity';
import { HistoriqueService } from './services/historique.service';
import { HistoriqueController } from './controllers/historique.controller';
// Import des entités des autres modules pour les relations
import { Demande } from '../request-management/entities/demande.entity';
import { DemandeLogiciel } from '../request-management/entities/demande-logiciel.entity';
import { Logiciel } from '../software-catalog/entities/logiciel.entity';
import { Utilisateur } from '../user-management/entities/utilisateur.entity';

/**
 * Module History
 * Gère l'historique et la traçabilité de toutes les actions
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Historique,
      Demande,
      DemandeLogiciel,
      Logiciel,
      Utilisateur,
    ]),
  ],
  controllers: [HistoriqueController],
  providers: [
    HistoriqueService,
    {
      provide: 'HistoriqueService',
      useExisting: HistoriqueService,
    },
  ],
  exports: [HistoriqueService, 'HistoriqueService', TypeOrmModule],
})
export class HistoryModule {}

