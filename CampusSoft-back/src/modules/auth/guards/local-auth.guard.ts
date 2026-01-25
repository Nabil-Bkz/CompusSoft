import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard pour authentifier un utilisateur via LocalStrategy
 * Utilisé principalement sur le endpoint /login
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
