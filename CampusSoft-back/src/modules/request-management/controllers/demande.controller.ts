import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DemandeService } from '../services/demande.service';
import { CreateDemandeDto } from '../dto/create-demande.dto';
import { UpdateDemandeDto } from '../dto/update-demande.dto';
import { FermerDemandeDto } from '../dto/fermer-demande.dto';
import { ResumeInstallationDto } from '../dto/resume-installation.dto';

/**
 * Controller pour la gestion des demandes (Enseignants)
 * Note: Authentification non implémentée pour l'instant
 * TODO: Ajouter guards d'authentification
 */
@ApiTags('Demandes')
@Controller('demandes')
// @ApiBearerAuth() // À activer quand l'authentification sera implémentée
export class DemandeController {
  constructor(private readonly demandeService: DemandeService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle demande (Enseignant)' })
  @ApiResponse({ status: 201, description: 'Demande créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiQuery({ name: 'enseignantId', required: true, description: 'ID de l\'enseignant' })
  async create(
    @Query('enseignantId') enseignantId: string,
    @Body() createDto: CreateDemandeDto,
  ) {
    return await this.demandeService.create(enseignantId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retourne toutes les demandes d\'un enseignant' })
  @ApiResponse({ status: 200, description: 'Liste des demandes' })
  @ApiQuery({ name: 'enseignantId', required: true, description: 'ID de l\'enseignant' })
  async findAllByEnseignant(@Query('enseignantId') enseignantId: string) {
    return await this.demandeService.findAllByEnseignant(enseignantId);
  }

  @Get('en-cours')
  @ApiOperation({ summary: 'Retourne toutes les demandes en cours (Service Informatique)' })
  @ApiResponse({ status: 200, description: 'Liste des demandes en cours' })
  async findAllEnCours() {
    return await this.demandeService.findAllEnCours();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retourne une demande par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la demande' })
  @ApiResponse({ status: 200, description: 'Détails de la demande' })
  @ApiResponse({ status: 404, description: 'Demande non trouvée' })
  async findOne(@Param('id') id: string) {
    return await this.demandeService.findOne(id);
  }

  @Get(':id/resume-installation')
  @ApiOperation({ summary: 'Retourne le résumé d\'installation par logiciel' })
  @ApiParam({ name: 'id', description: 'ID de la demande' })
  @ApiResponse({ status: 200, description: 'Résumé d\'installation par logiciel', type: [ResumeInstallationDto] })
  @ApiResponse({ status: 404, description: 'Demande non trouvée' })
  async obtenirResumeInstallation(@Param('id') id: string): Promise<ResumeInstallationDto[]> {
    const resumes = await this.demandeService.obtenirResumeInstallationParLogiciel(id);
    // Transformer la Value Object en DTO pour la sérialisation JSON
    return resumes.map((resume) => ({
      logicielId: resume.logicielId,
      logicielNom: resume.logicielNom,
      nombreSallesTotales: resume.nombreSallesTotales,
      nombreSallesInstallees: resume.nombreSallesInstallées, // Conversion avec é → sans é
      nombreSallesNonInstallees: resume.nombreSallesNonInstallées, // Conversion avec é → sans é
      statutInstallation: resume.statutInstallation,
      sallesInstallees: resume.sallesInstallées || [],
      sallesNonInstallees: resume.sallesNonInstallées || [],
      pourcentageInstallation: resume.pourcentageInstallation,
    }));
  }

  @Get(':id/details-installation')
  @ApiOperation({ summary: 'Retourne les détails complets d\'installation' })
  @ApiParam({ name: 'id', description: 'ID de la demande' })
  @ApiQuery({ name: 'logicielId', required: false, description: 'ID du logiciel (optionnel)' })
  @ApiResponse({ status: 200, description: 'Détails complets d\'installation' })
  @ApiResponse({ status: 404, description: 'Demande non trouvée' })
  async obtenirDetailsInstallation(
    @Param('id') id: string,
    @Query('logicielId') logicielId?: string,
  ) {
    const details = await this.demandeService.obtenirDetailsInstallationComplets(id, logicielId);
    // Convertir Map en objet pour la réponse JSON
    const result: Record<string, any> = {};
    details.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour une demande (Enseignant)' })
  @ApiParam({ name: 'id', description: 'ID de la demande' })
  @ApiQuery({ name: 'enseignantId', required: true, description: 'ID de l\'enseignant' })
  @ApiResponse({ status: 200, description: 'Demande mise à jour' })
  @ApiResponse({ status: 404, description: 'Demande non trouvée' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  @ApiResponse({ status: 400, description: 'Impossible de modifier cette demande' })
  async update(
    @Param('id') id: string,
    @Query('enseignantId') enseignantId: string,
    @Body() updateDto: UpdateDemandeDto,
  ) {
    return await this.demandeService.update(id, enseignantId, updateDto);
  }

  @Post(':id/fermer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ferme une demande (Enseignant)' })
  @ApiParam({ name: 'id', description: 'ID de la demande' })
  @ApiQuery({ name: 'enseignantId', required: true, description: 'ID de l\'enseignant' })
  @ApiResponse({ status: 200, description: 'Demande fermée' })
  @ApiResponse({ status: 404, description: 'Demande non trouvée' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  @ApiResponse({ status: 400, description: 'Impossible de fermer cette demande' })
  async fermer(
    @Param('id') id: string,
    @Query('enseignantId') enseignantId: string,
    @Body() fermerDto: FermerDemandeDto,
  ) {
    return await this.demandeService.fermer(id, enseignantId, fermerDto);
  }

  @Post(':id/en-cours')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marque une demande comme "en cours" (Service Informatique)' })
  @ApiParam({ name: 'id', description: 'ID de la demande' })
  @ApiResponse({ status: 200, description: 'Demande marquée comme en cours' })
  @ApiResponse({ status: 404, description: 'Demande non trouvée' })
  @ApiResponse({ status: 400, description: 'Transition d\'état invalide' })
  async marquerEnCours(@Param('id') id: string) {
    return await this.demandeService.marquerEnCours(id);
  }
}

