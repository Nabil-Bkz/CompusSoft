import {
  IsArray,
  IsString,
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsOptional,
  ArrayMinSize,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO pour créer un logiciel dans une demande
 */
export class LogicielSalleDto {
  @ApiProperty({
    description: 'ID du logiciel',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  logicielId: string;

  @ApiProperty({
    description: 'Liste des IDs des salles où installer le logiciel',
    example: [
      '123e4567-e89b-12d3-a456-426614174001',
      '123e4567-e89b-12d3-a456-426614174002',
    ],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Au moins une salle est requise par logiciel' })
  @IsUUID('4', { each: true })
  sallesIds: string[];
}

/**
 * DTO pour créer une demande
 */
export class CreateDemandeDto {
  @ApiProperty({
    description: 'Date souhaitée pour l\'installation',
    example: '2025-12-01',
  })
  @IsDateString()
  @IsNotEmpty()
  dateSouhaitee: string;

  @ApiProperty({
    description: 'Année universitaire (format: YYYY)',
    example: '2025',
  })
  @IsString()
  @IsNotEmpty()
  anneeUniversitaire: string;

  @ApiPropertyOptional({
    description: 'Commentaire de la demande',
    example: 'Installation urgente pour le cours de programmation',
  })
  @IsString()
  @IsOptional()
  commentaire?: string;

  @ApiProperty({
    description: 'Liste des logiciels à installer avec leurs salles',
    type: [LogicielSalleDto],
    example: [
      {
        logicielId: '123e4567-e89b-12d3-a456-426614174000',
        sallesIds: [
          '123e4567-e89b-12d3-a456-426614174001',
          '123e4567-e89b-12d3-a456-426614174002',
        ],
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Au moins un logiciel est requis' })
  @ValidateNested({ each: true })
  @Type(() => LogicielSalleDto)
  logiciels: LogicielSalleDto[];
}

