import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { HistoriqueService } from '../services/historique.service';
import { HistoriqueFilterDto } from '../dto/historique-filter.dto';

/**
 * Controller pour la consultation de l'historique
 * Note: Authentification non implémentée pour l'instant
 * TODO: Ajouter guards d'authentification
 */
@ApiTags('Historique')
@Controller('historique')
// @ApiBearerAuth() // À activer quand l'authentification sera implémentée
export class HistoriqueController {
  constructor(private readonly historiqueService: HistoriqueService) {}

  @Get()
  @ApiOperation({ summary: 'Retourne l\'historique avec filtres' })
  @ApiResponse({ status: 200, description: 'Liste des historiques' })
  async findAll(@Query() filters: HistoriqueFilterDto) {
    return await this.historiqueService.findAll(filters);
  }

  @Get('statistiques')
  @ApiOperation({ summary: 'Retourne les statistiques de l\'historique' })
  @ApiQuery({
    name: 'dateDebut',
    required: false,
    description: 'Date de début (format ISO)',
  })
  @ApiQuery({
    name: 'dateFin',
    required: false,
    description: 'Date de fin (format ISO)',
  })
  @ApiResponse({ status: 200, description: 'Statistiques de l\'historique' })
  async getStatistiques(
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    return await this.historiqueService.getStatistiques(
      dateDebut ? new Date(dateDebut) : undefined,
      dateFin ? new Date(dateFin) : undefined,
    );
  }

  @Get('demandes/:demandeId')
  @ApiOperation({ summary: 'Retourne l\'historique d\'une demande' })
  @ApiParam({ name: 'demandeId', description: 'ID de la demande' })
  @ApiResponse({ status: 200, description: 'Historique de la demande' })
  async findByDemande(@Param('demandeId') demandeId: string) {
    return await this.historiqueService.findByDemandeId(demandeId);
  }

  @Get('logiciels/:logicielId')
  @ApiOperation({ summary: 'Retourne l\'historique d\'un logiciel' })
  @ApiParam({ name: 'logicielId', description: 'ID du logiciel' })
  @ApiResponse({ status: 200, description: 'Historique du logiciel' })
  async findByLogiciel(@Param('logicielId') logicielId: string) {
    return await this.historiqueService.findByLogicielId(logicielId);
  }

  @Get('utilisateurs/:utilisateurId')
  @ApiOperation({ summary: 'Retourne l\'historique d\'un utilisateur' })
  @ApiParam({ name: 'utilisateurId', description: 'ID de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Historique de l\'utilisateur' })
  async findByUtilisateur(@Param('utilisateurId') utilisateurId: string) {
    return await this.historiqueService.findByUtilisateurId(utilisateurId);
  }
}

