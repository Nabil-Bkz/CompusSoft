import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attestation } from './entities/attestation.entity';
import { AttestationService } from './services/attestation.service';
import { AttestationController } from './controllers/attestation.controller';
// Import des entités des autres modules pour les relations
import { Demande } from '../request-management/entities/demande.entity';

/**
 * Module Attestation
 * Gère la réattestation annuelle des demandes
 */
@Module({
  imports: [TypeOrmModule.forFeature([Attestation, Demande])],
  controllers: [AttestationController],
  providers: [AttestationService],
  exports: [AttestationService, TypeOrmModule],
})
export class AttestationModule {}

