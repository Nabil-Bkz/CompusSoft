import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InstallationService } from '../services/installation.service';
import { InstallationSyncService } from '../services/installation-sync.service';
import { UpdateInstallationDto } from '../dto/update-installation.dto';

/**
 * Controller pour la gestion des installations (Service Informatique)
 * Note: Authentification non implémentée pour l'instant
 * TODO: Ajouter guards d'authentification avec rôle SERVICE_INFORMATIQUE
 */
@ApiTags('Installations')
@Controller('demandes/:demandeId/installation')
// @ApiBearerAuth() // À activer quand l'authentification sera implémentée
export class InstallationController {
  constructor(
    private readonly installationService: InstallationService,
    private readonly installationSyncService: InstallationSyncService,
  ) {}

  @Put(':demandeLogicielId/salles/:salleId')
  @ApiOperation({
    summary: 'Met à jour le statut d\'installation dans une salle spécifique',
  })
  @ApiParam({ name: 'demandeId', description: 'ID de la demande' })
  @ApiParam({ name: 'demandeLogicielId', description: 'ID du DemandeLogiciel' })
  @ApiParam({ name: 'salleId', description: 'ID de la salle' })
  @ApiResponse({ status: 200, description: 'Statut d\'installation mis à jour' })
  @ApiResponse({ status: 404, description: 'Ressource non trouvée' })
  async mettreAJourInstallation(
    @Param('demandeId') demandeId: string,
    @Param('demandeLogicielId') demandeLogicielId: string,
    @Param('salleId') salleId: string,
    @Body() updateDto: UpdateInstallationDto,
  ) {
    return await this.installationService.mettreAJourInstallation(
      demandeId,
      demandeLogicielId,
      salleId,
      updateDto,
    );
  }

  @Post(':demandeLogicielId/toutes-salles/installer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marque un logiciel comme installé dans toutes les salles',
  })
  @ApiParam({ name: 'demandeId', description: 'ID de la demande' })
  @ApiParam({ name: 'demandeLogicielId', description: 'ID du DemandeLogiciel' })
  @ApiResponse({ status: 200, description: 'Toutes les salles marquées comme installées' })
  @ApiResponse({ status: 404, description: 'Ressource non trouvée' })
  async marquerInstalleToutesSalles(
    @Param('demandeId') demandeId: string,
    @Param('demandeLogicielId') demandeLogicielId: string,
    @Body() body?: { dateInstallation?: string; commentaire?: string },
  ) {
    const dateInstallation = body?.dateInstallation
      ? new Date(body.dateInstallation)
      : undefined;
    await this.installationService.marquerInstalleToutesSalles(
      demandeId,
      demandeLogicielId,
      dateInstallation,
      body?.commentaire,
    );
    return { message: 'Toutes les salles marquées comme installées' };
  }

  @Post(':demandeId/synchroniser')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Force la synchronisation complète des statuts d\'une demande (Debug/Admin)',
    description: 'Recalcule tous les statuts : DemandeLogicielSalle → DemandeLogiciel → Demande',
  })
  @ApiParam({ name: 'demandeId', description: 'ID de la demande' })
  @ApiResponse({ status: 200, description: 'Synchronisation effectuée avec succès' })
  @ApiResponse({ status: 404, description: 'Demande non trouvée' })
  async synchroniserDemande(@Param('demandeId') demandeId: string) {
    await this.installationSyncService.synchroniserDemandeComplete(demandeId);
    return {
      message: `Synchronisation complète effectuée pour la demande ${demandeId}`,
    };
  }

  @Get(':demandeId/verifier-coherence')
  @ApiOperation({
    summary: 'Vérifie la cohérence des statuts d\'une demande (Debug/Admin)',
    description: 'Vérifie si les statuts sont synchronisés correctement et identifie les problèmes',
  })
  @ApiParam({ name: 'demandeId', description: 'ID de la demande' })
  @ApiResponse({
    status: 200,
    description: 'Rapport de cohérence des statuts',
  })
  @ApiResponse({ status: 404, description: 'Demande non trouvée' })
  async verifierCohérence(@Param('demandeId') demandeId: string) {
    return await this.installationSyncService.verifierCohérence(demandeId);
  }
}

