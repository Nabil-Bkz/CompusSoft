import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseBoolPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UtilisateurService } from '../services/utilisateur.service';
import { CreateUtilisateurDto } from '../dto/create-utilisateur.dto';
import { UpdateUtilisateurDto } from '../dto/update-utilisateur.dto';

/**
 * Controller pour la gestion des utilisateurs
 */
@ApiTags('Utilisateurs')
@Controller('utilisateurs')
export class UtilisateurController {
  constructor(private readonly utilisateurService: UtilisateurService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 409, description: 'Conflit (email déjà existant)' })
  async create(@Body() createDto: CreateUtilisateurDto) {
    return await this.utilisateurService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retourne tous les utilisateurs' })
  @ApiQuery({ name: 'actif', required: false, description: 'Filtrer par statut actif', type: Boolean })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs' })
  async findAll(
    @Query('actif', new DefaultValuePipe(undefined), new ParseBoolPipe({ optional: true }))
    actif?: boolean,
  ) {
    return await this.utilisateurService.findAll(actif);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retourne un utilisateur par son ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Détails de l\'utilisateur' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async findOne(@Param('id') id: string) {
    return await this.utilisateurService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour un utilisateur' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 409, description: 'Conflit (email déjà existant)' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUtilisateurDto,
  ) {
    return await this.utilisateurService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprime un utilisateur (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  @ApiResponse({ status: 204, description: 'Utilisateur supprimé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async remove(@Param('id') id: string) {
    await this.utilisateurService.remove(id);
  }

  @Get(':id/demandes')
  @ApiOperation({ summary: 'Retourne les demandes d\'un utilisateur' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Liste des demandes' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async findDemandes(@Param('id') id: string) {
    // TODO: Implémenter quand le module Request Management sera prêt
    return [];
  }
}

