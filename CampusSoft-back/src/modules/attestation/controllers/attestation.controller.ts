import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
import { AttestationService } from '../services/attestation.service';
import { CreateAttestationDto } from '../dto/create-attestation.dto';
import { ConfirmerAttestationDto } from '../dto/confirmer-attestation.dto';
import { AttestationStatus } from '../../../common/value-objects/attestation-status.vo';

/**
 * Controller pour la gestion des attestations
 * Note: Authentification non implémentée pour l'instant
 * TODO: Ajouter guards d'authentification
 */
@ApiTags('Attestations')
@Controller('attestations')
// @ApiBearerAuth() // À activer quand l'authentification sera implémentée
export class AttestationController {
  constructor(private readonly attestationService: AttestationService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une attestation pour une demande' })
  @ApiResponse({ status: 201, description: 'Attestation créée avec succès' })
  @ApiResponse({ status: 404, description: 'Demande non trouvée' })
  @ApiResponse({ status: 409, description: 'Attestation déjà existante' })
  async create(@Body() createDto: CreateAttestationDto) {
    return await this.attestationService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retourne toutes les attestations' })
  @ApiQuery({
    name: 'statut',
    required: false,
    enum: AttestationStatus,
    description: 'Filtrer par statut',
  })
  @ApiResponse({ status: 200, description: 'Liste des attestations' })
  async findAll(@Query('statut') statut?: AttestationStatus) {
    return await this.attestationService.findAll(statut);
  }

  @Get('rappel')
  @ApiOperation({ summary: 'Retourne les attestations nécessitant un rappel' })
  @ApiQuery({
    name: 'joursAvantExpiration',
    required: false,
    type: Number,
    description: 'Nombre de jours avant expiration pour le rappel (défaut: 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des attestations nécessitant un rappel',
  })
  async findPourRappel(
    @Query('joursAvantExpiration') joursAvantExpiration?: number,
  ) {
    const jours = joursAvantExpiration ? parseInt(joursAvantExpiration.toString(), 10) : 30;
    return await this.attestationService.findAttestationsPourRappel(jours);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retourne une attestation par son ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'attestation' })
  @ApiResponse({ status: 200, description: 'Détails de l\'attestation' })
  @ApiResponse({ status: 404, description: 'Attestation non trouvée' })
  async findOne(@Param('id') id: string) {
    return await this.attestationService.findOne(id);
  }

  @Get('demande/:demandeId')
  @ApiOperation({ summary: 'Retourne l\'attestation d\'une demande' })
  @ApiParam({ name: 'demandeId', description: 'ID de la demande' })
  @ApiResponse({ status: 200, description: 'Attestation de la demande' })
  @ApiResponse({ status: 404, description: 'Attestation non trouvée' })
  async findByDemande(@Param('demandeId') demandeId: string) {
    const attestation = await this.attestationService.findByDemandeId(demandeId);
    if (!attestation) {
      throw new Error('Attestation non trouvée');
    }
    return attestation;
  }

  @Post(':id/confirmer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirme une attestation (Enseignant)' })
  @ApiParam({ name: 'id', description: 'ID de l\'attestation' })
  @ApiResponse({ status: 200, description: 'Attestation confirmée' })
  @ApiResponse({ status: 404, description: 'Attestation non trouvée' })
  @ApiResponse({ status: 400, description: 'Impossible de confirmer cette attestation' })
  async confirmer(
    @Param('id') id: string,
    @Body() confirmerDto: ConfirmerAttestationDto,
  ) {
    return await this.attestationService.confirmer(id, confirmerDto);
  }

  @Post(':id/expirer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Expire une attestation (Automatique ou Admin)' })
  @ApiParam({ name: 'id', description: 'ID de l\'attestation' })
  @ApiResponse({ status: 200, description: 'Attestation expirée' })
  @ApiResponse({ status: 404, description: 'Attestation non trouvée' })
  async expirer(@Param('id') id: string) {
    return await this.attestationService.expirer(id);
  }

  @Post('expirer-dues')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Expire automatiquement les attestations dues (Job/Cron)',
  })
  @ApiResponse({
    status: 200,
    description: 'Nombre d\'attestations expirées',
  })
  async expirerDuues() {
    const count = await this.attestationService.expirerAttestationsDuues();
    return { message: `${count} attestation(s) expirée(s)`, count };
  }

  @Post('campagne/:anneeUniversitaire')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Crée des attestations pour toutes les demandes installées d\'une année (Admin)',
  })
  @ApiParam({ name: 'anneeUniversitaire', description: 'Année universitaire (YYYY)' })
  @ApiResponse({
    status: 200,
    description: 'Nombre d\'attestations créées',
  })
  async creerCampagne(@Param('anneeUniversitaire') anneeUniversitaire: string) {
    const count = await this.attestationService.creerAttestationsPourAnnee(
      anneeUniversitaire,
    );
    return {
      message: `${count} attestation(s) créée(s) pour l'année ${anneeUniversitaire}`,
      count,
    };
  }

  @Post(':id/marquer-rappel-envoye')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marque qu\'un rappel a été envoyé' })
  @ApiParam({ name: 'id', description: 'ID de l\'attestation' })
  @ApiResponse({ status: 200, description: 'Rappel marqué comme envoyé' })
  async marquerRappelEnvoye(@Param('id') id: string) {
    return await this.attestationService.marquerRappelEnvoye(id);
  }
}

