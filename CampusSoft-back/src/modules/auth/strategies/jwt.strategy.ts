import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenService, JwtPayload } from '../services/token.service';
import { UtilisateurService } from '../../user-management/services/utilisateur.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly utilisateurService: UtilisateurService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecret',
    });
  }

  /**
   * Validate JWT payload
   * Passport attaches returned value to request.user
   */
  async validate(payload: JwtPayload) {
    const user = await this.utilisateurService.findOne(payload.sub);
    if (!user || !user.actif) {
      throw new UnauthorizedException('Utilisateur invalide ou inactif');
    }

    // Attach minimal info to request.user
    return {
      userId: user.id,
      email: user.email,
      fullName: user.obtenirNomComplet(),
      role: user.role,
      actif: user.actif,
    };
  }
}
