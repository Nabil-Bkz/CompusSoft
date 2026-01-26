import {
  Controller,
  Get,
  Put,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DemandeLogicielService } from '../services/demande-logiciel.service';
import { DemandeLogicielFilterDto } from '../dto/demande-logiciel-filter.dto';
import { MarquerInstalleDemandeLogicielDto } from '../dto/marquer-installe-demande-logiciel.dto';
import { UpdateDemandeLogicielInstallationDto } from '../dto/update-demande-logiciel-installation.dto';
import { DemandeLogicielResponseDto } from '../dto/demande-logiciel-response.dto';
import { DemandeLogiciel } from '../entities/demande-logiciel.entity';
import { SoftwareInstallationStatus } from '../../../common/value-objects/software-installation-status.vo';

/**
 * Controller pour la gestion des demande logiciels (Service Informatique)
 * Note: Authentification non implémentée pour l'instant
 * TODO: Ajouter guards d'authentification avec rôle SERVICE_INFORMATIQUE
 */
@ApiTags('Demande Logiciels')
@Controller('demande-logiciels')
// @ApiBearerAuth() // À activer quand l'authentification sera implémentée
export class DemandeLogicielController {
  constructor(
    private readonly demandeLogicielService: DemandeLogicielService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Retourne tous les demande logiciels avec filtres optionnels',
    description: 'Permet de filtrer par demande, logiciel, statut d\'installation',
  })
  @ApiQuery({ name: 'demandeId', required: false, description: 'ID de la demande', type: String })
  @ApiQuery({ name: 'logicielId', required: false, description: 'ID du logiciel', type: String })
  @ApiQuery({ 
    name: 'statutInstallation', 
    required: false, 
    description: 'Statut d\'installation',
    enum: SoftwareInstallationStatus,
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre maximum de résultats (défaut: 100)', type: Number })
  @ApiQuery({ name: 'offset', required: false, description: 'Nombre de résultats à ignorer (défaut: 0)', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Liste des demande logiciels',
    type: [DemandeLogicielResponseDto],
  })
  async findAll(@Query() filters: DemandeLogicielFilterDto): Promise<DemandeLogicielResponseDto[]> {
    const demandeLogiciels = await this.demandeLogicielService.findAll(filters);
    
    // Transformer en DTO pour la réponse
    return demandeLogiciels.map((dl) => this.toResponseDto(dl));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retourne un demande logiciel par son ID',
  })
  @ApiParam({ name: 'id', description: 'ID du demande logiciel' })
  @ApiResponse({
    status: 200,
    description: 'Détails du demande logiciel',
    type: DemandeLogicielResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Demande logiciel non trouvé' })
  async findOne(@Param('id') id: string): Promise<DemandeLogicielResponseDto> {
    const demandeLogiciel = await this.demandeLogicielService.findOne(id);
    return this.toResponseDto(demandeLogiciel);
  }

  @Put(':id/marquer-installe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marque un demande logiciel comme installé',
    description: 'Marque toutes les salles associées comme installées et met à jour les statuts',
  })
  @ApiParam({ name: 'id', description: 'ID du demande logiciel' })
  @ApiResponse({
    status: 200,
    description: 'Demande logiciel marqué comme installé',
    type: DemandeLogicielResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Demande logiciel non trouvé' })
  @ApiResponse({ status: 400, description: 'Aucune salle associée' })
  async marquerInstalle(
    @Param('id') id: string,
    @Body() dto: MarquerInstalleDemandeLogicielDto,
  ): Promise<DemandeLogicielResponseDto> {
    const demandeLogiciel = await this.demandeLogicielService.marquerInstalle(id, dto);
    return this.toResponseDto(demandeLogiciel);
  }

  @Patch(':id/installation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Met à jour l\'installation d\'un demande logiciel',
    description: 'Permet de mettre à jour le statut d\'installation, la date et le commentaire. Si le statut est TOUS_INSTALLES, toutes les salles sont automatiquement marquées comme installées. Si tous les logiciels de la demande sont installés, le statut de la demande devient automatiquement INSTALLEE.',
  })
  @ApiParam({ name: 'id', description: 'ID du demande logiciel' })
  @ApiResponse({
    status: 200,
    description: 'Installation mise à jour avec succès',
    type: DemandeLogicielResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Demande logiciel non trouvé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async updateInstallation(
    @Param('id') id: string,
    @Body() dto: UpdateDemandeLogicielInstallationDto,
  ): Promise<DemandeLogicielResponseDto> {
    const demandeLogiciel = await this.demandeLogicielService.updateInstallation(id, dto);
    return this.toResponseDto(demandeLogiciel);
  }

  /**
   * Transforme un DemandeLogiciel en DTO de réponse
   */
  private toResponseDto(dl: DemandeLogiciel): DemandeLogicielResponseDto {
    const nombreSalles = dl.demandeLogicielSalles?.length || 0;
    const nombreSallesInstallees =
      dl.demandeLogicielSalles?.filter((dls) => dls.estInstallee).length || 0;

    return {
      id: dl.id,
      demandeId: dl.demandeId,
      logicielId: dl.logicielId,
      logiciel: dl.logiciel,
      statutInstallation: dl.statutInstallation,
      dateInstallation: dl.dateInstallation,
      commentaire: dl.commentaire,
      dateChangement: dl.dateChangement,
      dateCreation: dl.dateCreation,
      nombreSalles,
      nombreSallesInstallees,
    };
  }
}

