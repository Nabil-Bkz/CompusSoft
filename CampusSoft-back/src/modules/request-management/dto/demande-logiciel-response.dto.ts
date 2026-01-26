import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SoftwareInstallationStatus } from '../../../common/value-objects/software-installation-status.vo';
import { Logiciel } from '../../software-catalog/entities/logiciel.entity';

/**
 * DTO de réponse pour un DemandeLogiciel
 */
export class DemandeLogicielResponseDto {
  @ApiProperty({
    description: 'ID du demande logiciel',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID de la demande',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  demandeId: string;

  @ApiProperty({
    description: 'ID du logiciel',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  logicielId: string;

  @ApiProperty({
    description: 'Informations du logiciel',
    type: () => Logiciel,
  })
  logiciel: Logiciel;

  @ApiProperty({
    description: 'Statut d\'installation',
    enum: SoftwareInstallationStatus,
    example: SoftwareInstallationStatus.EN_ATTENTE,
  })
  statutInstallation: SoftwareInstallationStatus;

  @ApiPropertyOptional({
    description: 'Date d\'installation',
    example: '2025-12-01T10:00:00Z',
  })
  dateInstallation: Date | null;

  @ApiPropertyOptional({
    description: 'Commentaire',
    example: 'Installation réussie',
  })
  commentaire: string | null;

  @ApiPropertyOptional({
    description: 'Date de changement de statut',
    example: '2025-12-01T10:00:00Z',
  })
  dateChangement: Date | null;

  @ApiProperty({
    description: 'Date de création',
    example: '2025-11-01T10:00:00Z',
  })
  dateCreation: Date;

  @ApiProperty({
    description: 'Nombre total de salles associées',
    example: 5,
  })
  nombreSalles: number;

  @ApiProperty({
    description: 'Nombre de salles installées',
    example: 3,
  })
  nombreSallesInstallees: number;
}

