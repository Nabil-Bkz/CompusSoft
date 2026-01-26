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
import { LogicielService } from '../services/logiciel.service';
import { CreateLogicielDto } from '../dto/create-logiciel.dto';
import { UpdateLogicielDto } from '../dto/update-logiciel.dto';

/**
 * Controller pour la gestion des logiciels
 */
@ApiTags('Logiciels')
@Controller('logiciels')
export class LogicielController {
  constructor(private readonly logicielService: LogicielService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau logiciel' })
  @ApiResponse({ status: 201, description: 'Logiciel créé avec succès' })
  @ApiResponse({ status: 409, description: 'Conflit (logiciel déjà existant)' })
  async create(@Body() createDto: CreateLogicielDto) {
    return await this.logicielService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retourne tous les logiciels (avec filtres)' })
  @ApiQuery({ name: 'search', required: false, description: 'Recherche par nom' })
  @ApiQuery({ name: 'actif', required: false, description: 'Filtrer par statut actif', type: Boolean })
  @ApiResponse({ status: 200, description: 'Liste des logiciels' })
  async findAll(
    @Query('search') search?: string,
    @Query('actif', new ParseBoolPipe({ optional: true })) 
    actif?: boolean,
  ) {
    return await this.logicielService.findAll(search, actif);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retourne un logiciel par son ID' })
  @ApiParam({ name: 'id', description: 'ID du logiciel' })
  @ApiResponse({ status: 200, description: 'Détails du logiciel' })
  @ApiResponse({ status: 404, description: 'Logiciel non trouvé' })
  async findOne(@Param('id') id: string) {
    return await this.logicielService.findOne(id);
  }

  @Get(':id/salles')
  @ApiOperation({ summary: 'Retourne les salles où un logiciel est installé' })
  @ApiParam({ name: 'id', description: 'ID du logiciel' })
  @ApiResponse({ status: 200, description: 'Liste des salles d\'installation' })
  @ApiResponse({ status: 404, description: 'Logiciel non trouvé' })
  async findSallesInstallation(@Param('id') id: string) {
    return await this.logicielService.findSallesInstallation(id);
  }

  @Get(':id/est-installe-dans/:salleId')
  @ApiOperation({ summary: 'Vérifie si un logiciel est installé dans une salle' })
  @ApiParam({ name: 'id', description: 'ID du logiciel' })
  @ApiParam({ name: 'salleId', description: 'ID de la salle' })
  @ApiResponse({ status: 200, description: 'Statut d\'installation' })
  @ApiResponse({ status: 404, description: 'Logiciel ou salle non trouvé' })
  async estInstalleDans(
    @Param('id') id: string,
    @Param('salleId') salleId: string,
  ) {
    const estInstalle = await this.logicielService.estInstalleDans(salleId, id);
    return { logicielId: id, salleId, estInstalle };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour un logiciel' })
  @ApiParam({ name: 'id', description: 'ID du logiciel' })
  @ApiResponse({ status: 200, description: 'Logiciel mis à jour' })
  @ApiResponse({ status: 404, description: 'Logiciel non trouvé' })
  @ApiResponse({ status: 409, description: 'Conflit (version déjà existante)' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLogicielDto,
  ) {
    return await this.logicielService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprime un logiciel (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID du logiciel' })
  @ApiResponse({ status: 204, description: 'Logiciel supprimé' })
  @ApiResponse({ status: 404, description: 'Logiciel non trouvé' })
  async remove(@Param('id') id: string) {
    await this.logicielService.remove(id);
  }
}

