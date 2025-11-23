import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUtilisateurDto } from './create-utilisateur.dto';

/**
 * DTO pour créer un enseignant (inclut création utilisateur)
 */
export class CreateEnseignantDto extends CreateUtilisateurDto {
  @ApiProperty({
    description: 'Numéro d\'employé de l\'enseignant',
    example: 'EMP001',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  numeroEmploye: string;

  @ApiPropertyOptional({
    description: 'Bureau de l\'enseignant',
    example: 'Bâtiment A, Bureau 101',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  bureau?: string;
}

