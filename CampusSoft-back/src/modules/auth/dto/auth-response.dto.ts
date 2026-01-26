import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/value-objects/user-role.vo';

// DTO représentant la réponse d'une connexion réussie

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token JWT permettant d’accéder aux endpoints protégés',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'ID de l’utilisateur connecté',
    example: 'uuid-1234-5678',
  })
  userId: string;

  @ApiProperty({
    description: 'Email de l’utilisateur connecté',
    example: 'john.doe@univ-lorraine.fr',
  })
  email: string;

  @ApiProperty({
    description: 'Nom complet de l’utilisateur',
    example: 'John Doe',
  })
  fullName: string;

  @ApiProperty({
    description: 'Rôle de l’utilisateur',
    enum: UserRole,
    example: UserRole.ENSEIGNANT,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Indique si l’utilisateur est actif',
    example: true,
  })
  actif: boolean;
}
