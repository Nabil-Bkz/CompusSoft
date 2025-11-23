import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../common/value-objects/user-role.vo';

/**
 * DTO pour créer un utilisateur
 */
export class CreateUtilisateurDto {
  @ApiProperty({
    description: 'Email de l\'utilisateur',
    example: 'john.doe@university.edu',
    maxLength: 255,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description: 'Nom de l\'utilisateur',
    example: 'Doe',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nom: string;

  @ApiProperty({
    description: 'Prénom de l\'utilisateur',
    example: 'John',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  prenom: string;

  @ApiPropertyOptional({
    description: 'ID SSO (pour intégration future)',
    example: 'sso-123456',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  ssoId?: string;

  @ApiProperty({
    description: 'Rôle de l\'utilisateur',
    enum: UserRole,
    example: UserRole.ENSEIGNANT,
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiPropertyOptional({
    description: 'Indique si l\'utilisateur est actif',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}

