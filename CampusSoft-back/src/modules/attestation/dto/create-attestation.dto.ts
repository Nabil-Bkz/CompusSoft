import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttestationStatus } from '../../../common/value-objects/attestation-status.vo';

/**
 * DTO pour créer une attestation
 */
export class CreateAttestationDto {
  @ApiProperty({
    description: 'ID de la demande',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  demandeId: string;

  @ApiProperty({
    description: 'Année universitaire (format: YYYY)',
    example: '2025',
  })
  @IsString()
  @IsNotEmpty()
  anneeUniversitaire: string;

  @ApiProperty({
    description: 'Date de début de la période d\'attestation',
    example: '2025-09-01',
  })
  @IsDateString()
  @IsNotEmpty()
  dateDebut: string;

  @ApiProperty({
    description: 'Date de fin de la période d\'attestation',
    example: '2026-08-31',
  })
  @IsDateString()
  @IsNotEmpty()
  dateFin: string;

  @ApiPropertyOptional({
    description: 'Statut initial',
    enum: AttestationStatus,
    example: AttestationStatus.PENDING,
  })
  @IsEnum(AttestationStatus)
  @IsOptional()
  statut?: AttestationStatus;

  @ApiPropertyOptional({
    description: 'Commentaire',
    example: 'Réattestation pour l\'année universitaire 2025-2026',
  })
  @IsString()
  @IsOptional()
  commentaire?: string;
}

