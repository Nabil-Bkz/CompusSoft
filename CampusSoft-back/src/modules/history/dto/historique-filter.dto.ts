import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TypeActionHistorique } from '../entities/historique.entity';
import { RequestStatus } from '../../../common/value-objects/request-status.vo';

/**
 * DTO pour filtrer les historiques
 */
export class HistoriqueFilterDto {
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
    description: 'ID de l\'utilisateur',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID()
  @IsOptional()
  utilisateurId?: string;

  @ApiPropertyOptional({
    description: 'Type d\'action',
    enum: TypeActionHistorique,
  })
  @IsEnum(TypeActionHistorique)
  @IsOptional()
  typeAction?: TypeActionHistorique;

  @ApiPropertyOptional({
    description: 'Date de début (format ISO)',
    example: '2025-01-01T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  dateDebut?: string;

  @ApiPropertyOptional({
    description: 'Date de fin (format ISO)',
    example: '2025-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  dateFin?: string;

  @ApiPropertyOptional({
    description: 'État de la demande (avant ou après)',
    enum: RequestStatus,
  })
  @IsEnum(RequestStatus)
  @IsOptional()
  etat?: RequestStatus;
}

