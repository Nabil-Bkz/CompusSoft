import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard pour valider un refresh token
 * Utilisé sur le endpoint /refresh
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
