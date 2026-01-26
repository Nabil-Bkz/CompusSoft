import { IsOptional, IsUUID, IsEnum, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SoftwareInstallationStatus } from '../../../common/value-objects/software-installation-status.vo';

/**
 * DTO pour filtrer les demande logiciels
 */
export class DemandeLogicielFilterDto {
  @ApiPropertyOptional({
    description: 'ID de la demande',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  demandeId?: string;

  @ApiPropertyOptional({
    description: 'ID du logiciel',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsOptional()
  logicielId?: string;

  @ApiPropertyOptional({
    description: 'Statut d\'installation',
    enum: SoftwareInstallationStatus,
    example: SoftwareInstallationStatus.EN_ATTENTE,
  })
  @IsEnum(SoftwareInstallationStatus)
  @IsOptional()
  statutInstallation?: SoftwareInstallationStatus;

  @ApiPropertyOptional({
    description: 'Nombre maximum de résultats',
    example: 50,
    default: 100,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Nombre de résultats à ignorer (pagination)',
    example: 0,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;
}

