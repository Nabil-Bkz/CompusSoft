import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO pour rafraîchir un JWT
 */
export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token fourni par le serveur lors de la connexion initiale',
    example: 'refresh-token-xyz',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
