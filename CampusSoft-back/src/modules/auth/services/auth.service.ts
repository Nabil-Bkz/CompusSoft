import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { UtilisateurService } from '../../user-management/services/utilisateur.service';
import { LoginDto } from '../dto/login.dto';
import { TokenService, JwtPayload } from './token.service';
import * as bcrypt from 'bcrypt';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly utilisateurService: UtilisateurService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Valide email + mot de passe
   */
  async validateUser(email: string, password: string) {
    const user = await this.utilisateurService.findByEmail(email);

    if (!user || !user.actif) {
      throw new UnauthorizedException('Utilisateur inconnu ou inactif');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'Authentification par mot de passe non autorisée',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    return user;
  }

  /**
   * Login (email + password)
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(
      loginDto.email,
      loginDto.password,
    );

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.tokenService.createAccessToken(payload);

    return {
      accessToken,
      userId: user.id,
      email: user.email,
      fullName: user.obtenirNomComplet(),
      role: user.role,
      actif: user.actif,
    };
  }

  /**
   * Refresh access token FROM PAYLOAD (via JwtRefreshGuard)
   */
  async refreshFromPayload(
    user: AuthenticatedUser,
  ): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.tokenService.createAccessToken(payload);

    return {
      accessToken,
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      actif: true,
    };
  }

  /**
   * Optional helper (used by guards / strategies if needed)
   */
  async validateUserById(userId: string) {
    const user = await this.utilisateurService.findOne(userId);

    if (!user || !user.actif) {
      throw new ForbiddenException('Utilisateur invalide ou inactif');
    }

    return user;
  }
}
