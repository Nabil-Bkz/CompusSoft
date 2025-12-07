import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO pour fermer une demande
 */
export class FermerDemandeDto {
  @ApiProperty({
    description: 'Commentaire de fermeture (obligatoire)',
    example: 'Installation annulée, changement de programme',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Le commentaire de fermeture doit contenir au moins 3 caractères' })
  commentaireFermeture: string;
}

