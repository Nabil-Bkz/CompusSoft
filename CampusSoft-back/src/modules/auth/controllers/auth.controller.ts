import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { Request } from 'express';

/**
 * Controller pour l’authentification
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login (email + mot de passe)
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion d’un utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie',
    type: AuthResponseDto,
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  /**
   * Refresh JWT token
   */
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rafraîchir le token JWT' })
  @ApiResponse({
    status: 200,
    description: 'Nouveau token généré',
    type: AuthResponseDto,
  })
  async refresh(@Req() req: Request): Promise<AuthResponseDto> {
    const user = req.user as AuthenticatedUser;
    return this.authService.refreshFromPayload(user);
  }

  /**
   * Informations de l’utilisateur connecté
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Utilisateur connecté' })
  @ApiResponse({
    status: 200,
    description: 'Informations utilisateur',
    type: AuthResponseDto,
  })
  async me(@Req() req: Request): Promise<AuthResponseDto> {
    const user = req.user as AuthenticatedUser;

    return {
      accessToken: null, // not refreshed here
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      actif: true,
    };
  }

  /**
   * Logout (stateless JWT → no-op)
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Déconnexion' })
  async logout(): Promise<void> {
    // JWT is stateless → nothing to invalidate server-side
    return;
  }
}
