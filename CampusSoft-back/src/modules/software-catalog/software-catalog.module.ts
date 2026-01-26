import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logiciel } from './entities/logiciel.entity';
import { LogicielService } from './services/logiciel.service';
import { LogicielController } from './controllers/logiciel.controller';
// Import des entités nécessaires pour trouver les salles d'installation
import { DemandeLogiciel } from '../request-management/entities/demande-logiciel.entity';
import { DemandeLogicielSalle } from '../request-management/entities/demande-logiciel-salle.entity';
import { Salle } from '../infrastructure/entities/salle.entity';

/**
 * Module Software Catalog
 * Gère le catalogue des logiciels pédagogiques
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Logiciel,
      DemandeLogiciel,
      DemandeLogicielSalle,
      Salle,
    ]),
  ],
  controllers: [LogicielController],
  providers: [LogicielService],
  exports: [LogicielService, TypeOrmModule],
})
export class SoftwareCatalogModule {}

