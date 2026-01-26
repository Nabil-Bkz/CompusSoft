import { IsOptional, IsDateString, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO pour marquer un demande logiciel comme installé
 */
export class MarquerInstalleDemandeLogicielDto {
  @ApiPropertyOptional({
    description: 'Date d\'installation (si non fournie, utilise la date actuelle)',
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

