import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO pour créer un département
 */
export class CreateDepartementDto {
  @ApiProperty({
    description: 'Nom du département',
    example: 'Informatique',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nom: string;

  @ApiProperty({
    description: 'Code unique du département',
    example: 'INFO',
    maxLength: 50,
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(2)
  code: string;

  @ApiPropertyOptional({
    description: 'Description du département',
    example: 'Département d\'informatique et de mathématiques',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

