import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../../common/value-objects/user-role.vo';
import { SignOptions } from 'jsonwebtoken'; // correct

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class TokenService {
  private readonly accessTokenExpiry: SignOptions['expiresIn'];
  private readonly refreshTokenExpiry: SignOptions['expiresIn'];

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenExpiry = (this.configService.get('JWT_ACCESS_EXPIRY') ?? '15m') as SignOptions['expiresIn'];
    this.refreshTokenExpiry = (this.configService.get('JWT_REFRESH_EXPIRY') ?? '7d') as SignOptions['expiresIn'];
  }

  /**
   * Crée un access token
   */
  createAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.accessTokenExpiry,
    });
  }

  /**
   * Crée un refresh token
   */
  createRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.refreshTokenExpiry,
    });
  }

  /**
   * Vérifie et décode un token
   */
  verifyToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }
}
