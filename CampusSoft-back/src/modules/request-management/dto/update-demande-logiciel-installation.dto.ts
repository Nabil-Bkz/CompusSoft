import { IsOptional, IsDateString, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SoftwareInstallationStatus } from '../../../common/value-objects/software-installation-status.vo';

/**
 * DTO pour mettre à jour l'installation d'un demande logiciel
 */
export class UpdateDemandeLogicielInstallationDto {
  @ApiPropertyOptional({
    description: 'Nouveau statut d\'installation',
    enum: SoftwareInstallationStatus,
    example: SoftwareInstallationStatus.TOUS_INSTALLES,
  })
  @IsEnum(SoftwareInstallationStatus)
  @IsOptional()
  statutInstallation?: SoftwareInstallationStatus;

  @ApiPropertyOptional({
    description: 'Date d\'installation',
    example: '2025-12-01T10:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  dateInstallation?: string;

  @ApiPropertyOptional({
    description: 'Commentaire sur l\'installation',
    example: 'Installation mise à jour, tous les postes opérationnels',
  })
  @IsString()
  @IsOptional()
  commentaire?: string;
}

