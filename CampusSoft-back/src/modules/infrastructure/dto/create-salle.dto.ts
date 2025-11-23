import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoomType } from '../../../common/value-objects/room-type.vo';

/**
 * DTO pour créer une salle
 */
export class CreateSalleDto {
  @ApiProperty({
    description: 'Nom de la salle',
    example: 'Salle A101',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nom: string;

  @ApiPropertyOptional({
    description: 'Capacité de la salle',
    example: 30,
    minimum: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  capacite?: number;

  @ApiProperty({
    description: 'Type de salle',
    enum: RoomType,
    example: RoomType.DEPARTEMENT,
  })
  @IsEnum(RoomType)
  @IsNotEmpty()
  type: RoomType;

  @ApiPropertyOptional({
    description: 'Localisation de la salle',
    example: 'Bâtiment A, 1er étage',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  localisation?: string;

  @ApiPropertyOptional({
    description: 'Description de la salle',
    example: 'Salle équipée de projecteurs et ordinateurs',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'ID du département (null si salle mutualisée)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  departementId?: string;
}

