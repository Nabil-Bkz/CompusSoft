import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard pour protéger les endpoints nécessitant un JWT
 * Valide le token via JwtStrategy
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
