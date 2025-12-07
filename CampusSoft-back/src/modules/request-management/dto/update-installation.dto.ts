import {
  IsBoolean,
  IsOptional,
  IsDateString,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO pour mettre à jour le statut d'installation dans une salle
 */
export class UpdateInstallationDto {
  @ApiProperty({
    description: 'Indique si le logiciel est installé',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  estInstallee: boolean;

  @ApiPropertyOptional({
    description: 'Date d\'installation (si installé)',
    example: '2025-12-01T10:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  dateInstallation?: string;

  @ApiPropertyOptional({
    description: 'Commentaire sur l\'installation',
    example: 'Installation réussie, tous les postes opérationnels',
  })
  @IsString()
  @IsOptional()
  commentaire?: string;
}

