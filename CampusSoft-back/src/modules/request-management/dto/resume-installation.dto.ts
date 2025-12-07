import { ApiProperty } from '@nestjs/swagger';
import { SoftwareInstallationStatus } from '../../../common/value-objects/software-installation-status.vo';

/**
 * DTO de réponse pour un résumé d'installation par logiciel
 */
export class ResumeInstallationDto {
  @ApiProperty({ description: 'ID du logiciel' })
  logicielId: string;

  @ApiProperty({ description: 'Nom du logiciel' })
  logicielNom: string;

  @ApiProperty({ description: 'Nombre total de salles' })
  nombreSallesTotales: number;

  @ApiProperty({ description: 'Nombre de salles installées' })
  nombreSallesInstallees: number;

  @ApiProperty({ description: 'Nombre de salles non installées' })
  nombreSallesNonInstallees: number;

  @ApiProperty({ enum: SoftwareInstallationStatus, description: 'Statut d\'installation' })
  statutInstallation: SoftwareInstallationStatus;

  @ApiProperty({
    description: 'Salles installées',
    type: 'array',
    items: { type: 'object', properties: { id: { type: 'string' }, nom: { type: 'string' } } },
  })
  sallesInstallees: Array<{ id: string; nom: string }>;

  @ApiProperty({
    description: 'Salles non installées',
    type: 'array',
    items: { type: 'object', properties: { id: { type: 'string' }, nom: { type: 'string' } } },
  })
  sallesNonInstallees: Array<{ id: string; nom: string }>;

  @ApiProperty({ description: 'Pourcentage d\'installation' })
  pourcentageInstallation: number;
}

