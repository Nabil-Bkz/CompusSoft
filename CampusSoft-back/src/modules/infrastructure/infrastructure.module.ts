import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departement } from './entities/departement.entity';
import { Salle } from './entities/salle.entity';
import { DepartementService } from './services/departement.service';
import { SalleService } from './services/salle.service';
import { DepartementController } from './controllers/departement.controller';
import { SalleController } from './controllers/salle.controller';

/**
 * Module Infrastructure
 * Gère les départements et les salles
 */
@Module({
  imports: [TypeOrmModule.forFeature([Departement, Salle])],
  controllers: [DepartementController, SalleController],
  providers: [DepartementService, SalleService],
  exports: [DepartementService, SalleService, TypeOrmModule],
})
export class InfrastructureModule {}

