import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  MaxLength,
  Min,
  Max,
  Matches,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO pour créer un logiciel
 */
export class CreateLogicielDto {
  @ApiProperty({
    description: 'Nom du logiciel',
    example: 'Visual Studio Code',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nom: string;

  @ApiProperty({
    description: 'Éditeur du logiciel',
    example: 'Microsoft',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  editeur: string;

  @ApiProperty({
    description: 'Version du logiciel (format: major.minor.patch)',
    example: '1.85.0',
    pattern: '^\\d+\\.\\d+\\.\\d+$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+\.\d+\.\d+$/, {
    message: 'La version doit être au format major.minor.patch (ex: 1.2.3)',
  })
  version: string;

  @ApiPropertyOptional({
    description: 'Usage du logiciel',
    example: 'Édition de code',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  usage?: string;

  @ApiPropertyOptional({
    description: 'Description du logiciel',
    example: 'Éditeur de code open-source',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Durée maximale d\'utilisation en jours (max 365 jours = 1 an)',
    example: 365,
    minimum: 1,
    maximum: 365,
    default: 365,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(365)
  dureeMax?: number;

  @ApiPropertyOptional({
    description: 'Type de licence',
    example: 'Open Source',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  licence?: string;

  @ApiPropertyOptional({
    description: 'URL du logo du logiciel',
    example: 'https://code.visualstudio.com/assets/images/code-stable.png',
    maxLength: 500,
  })
  @IsUrl({}, { message: 'Le logo doit être une URL valide' })
  @IsOptional()
  @MaxLength(500)
  logoUrl?: string;


  @ApiPropertyOptional({
    description: 'Indique si le logiciel est actif',
    example: true,
    default: true,
  })
  @IsOptional()
  actif?: boolean;
}

