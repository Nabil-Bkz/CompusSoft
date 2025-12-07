import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO pour confirmer une attestation
 */
export class ConfirmerAttestationDto {
  @ApiPropertyOptional({
    description: 'Commentaire de confirmation',
    example: 'Réattestation confirmée pour l\'année 2025-2026',
  })
  @IsString()
  @IsOptional()
  commentaire?: string;
}

