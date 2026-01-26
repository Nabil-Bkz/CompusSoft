import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Utilisateur } from '../../user-management/entities/utilisateur.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email', // default is 'username'
      passwordField: 'password',
    });
  }

  /**
   * Validate user credentials
   * Called automatically by Passport
   */
  async validate(email: string, password: string): Promise<Utilisateur> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }
    return user; // Passport attaches this to request.user
  }
}
