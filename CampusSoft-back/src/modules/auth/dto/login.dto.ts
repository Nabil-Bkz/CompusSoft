import { IsEmail, IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// DTO pour la connexion d'un utilisateur

export class LoginDto {
  @ApiProperty({
    description: 'Email de l’utilisateur',
    example: 'john.doe@univ-lorraine.fr',
    maxLength: 255,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description: 'Mot de passe de l’utilisateur',
    example: 'StrongP@ssw0rd!',
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password: string;

  @ApiPropertyOptional({
    description: 'Token SSO si connexion via SSO',
    example: 'sso-token-xyz',
  })
  @IsString()
  @IsOptional()
  ssoToken?: string;
}
