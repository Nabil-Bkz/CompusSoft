import {
  Controller,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UtilisateurService } from '../services/utilisateur.service';

/**
 * Controller pour la gestion du service informatique
 */
@ApiTags('Service Informatique')
@Controller('service-informatique')
export class ServiceInformatiqueController {
  constructor(private readonly utilisateurService: UtilisateurService) {}

  @Get()
  @ApiOperation({ summary: 'Retourne tous les membres du service informatique' })
  @ApiResponse({ status: 200, description: 'Liste des membres du service informatique' })
  async findAll() {
    return await this.utilisateurService.findServiceInformatique();
  }
}

