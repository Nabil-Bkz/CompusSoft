import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequestStatus } from '../../../common/value-objects/request-status.vo';
import { SoftwareInstallationStatus } from '../../../common/value-objects/software-installation-status.vo';

/**
 * DTO de réponse pour une demande
 */
export class DemandeResponseDto {
  @ApiProperty({ description: 'ID de la demande' })
  id: string;

  @ApiProperty({ description: 'ID de l\'enseignant' })
  enseignantId: string;

  @ApiProperty({ description: 'Date de création' })
  dateCreation: Date;

  @ApiPropertyOptional({ description: 'Date de dernière modification' })
  dateDerniereModification?: Date | null;

  @ApiProperty({ description: 'Date souhaitée' })
  dateSouhaitee: Date;

  @ApiProperty({ description: 'Année universitaire' })
  anneeUniversitaire: string;

  @ApiProperty({ enum: RequestStatus, description: 'État de la demande' })
  etat: RequestStatus;

  @ApiPropertyOptional({ description: 'Commentaire' })
  commentaire?: string | null;

  @ApiPropertyOptional({ description: 'Commentaire de fermeture' })
  commentaireFermeture?: string | null;

  @ApiPropertyOptional({ description: 'Date de fermeture' })
  dateFermeture?: Date | null;

  @ApiPropertyOptional({ description: 'Date d\'expiration' })
  dateExpiration?: Date | null;

  @ApiProperty({ description: 'Nombre de logiciels dans la demande' })
  nombreLogiciels: number;

  @ApiPropertyOptional({ description: 'Statut global d\'installation' })
  statutGlobalInstallation?: SoftwareInstallationStatus;
}

