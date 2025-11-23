import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utilisateur } from './entities/utilisateur.entity';
import { Enseignant } from './entities/enseignant.entity';
import { ServiceInformatique } from './entities/service-informatique.entity';
import { Administrateur } from './entities/administrateur.entity';
import { UtilisateurService } from './services/utilisateur.service';
import { EnseignantService } from './services/enseignant.service';
import { UtilisateurController } from './controllers/utilisateur.controller';
import { EnseignantController } from './controllers/enseignant.controller';
import { ServiceInformatiqueController } from './controllers/service-informatique.controller';

/**
 * Module User Management
 * Gère les utilisateurs et leurs rôles (Enseignant, ServiceInformatique, Administrateur)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Utilisateur,
      Enseignant,
      ServiceInformatique,
      Administrateur,
    ]),
  ],
  controllers: [
    UtilisateurController,
    EnseignantController,
    ServiceInformatiqueController,
  ],
  providers: [UtilisateurService, EnseignantService],
  exports: [UtilisateurService, EnseignantService, TypeOrmModule],
})
export class UserManagementModule {}

