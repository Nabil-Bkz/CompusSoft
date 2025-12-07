import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de réponse pour les détails d'installation d'un logiciel dans une salle
 */
export class DetailInstallationDto {
  @ApiProperty({ description: 'ID de la salle' })
  salleId: string;

  @ApiProperty({ description: 'Nom de la salle' })
  salleNom: string;

  @ApiProperty({ description: 'Indique si le logiciel est installé' })
  estInstallee: boolean;

  @ApiPropertyOptional({ description: 'Date d\'installation' })
  dateInstallation?: Date | null;

  @ApiProperty({ description: 'Date d\'assignation' })
  dateAssignation: Date;

  @ApiPropertyOptional({ description: 'Commentaire' })
  commentaire?: string | null;
}

