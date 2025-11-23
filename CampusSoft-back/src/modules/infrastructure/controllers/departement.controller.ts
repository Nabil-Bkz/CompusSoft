import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { DepartementService } from '../services/departement.service';
import { CreateDepartementDto } from '../dto/create-departement.dto';
import { UpdateDepartementDto } from '../dto/update-departement.dto';

/**
 * Controller pour la gestion des départements
 */
@ApiTags('Départements')
@Controller('departements')
export class DepartementController {
  constructor(private readonly departementService: DepartementService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau département' })
  @ApiResponse({ status: 201, description: 'Département créé avec succès' })
  @ApiResponse({ status: 409, description: 'Conflit (nom ou code déjà existant)' })
  async create(@Body() createDto: CreateDepartementDto) {
    return await this.departementService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retourne tous les départements' })
  @ApiResponse({ status: 200, description: 'Liste des départements' })
  async findAll() {
    return await this.departementService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retourne un département par son ID' })
  @ApiParam({ name: 'id', description: 'ID du département' })
  @ApiResponse({ status: 200, description: 'Détails du département' })
  @ApiResponse({ status: 404, description: 'Département non trouvé' })
  async findOne(@Param('id') id: string) {
    return await this.departementService.findOne(id);
  }

  @Get(':id/salles')
  @ApiOperation({ summary: 'Retourne les salles d\'un département' })
  @ApiParam({ name: 'id', description: 'ID du département' })
  @ApiResponse({ status: 200, description: 'Liste des salles du département' })
  @ApiResponse({ status: 404, description: 'Département non trouvé' })
  async findSalles(@Param('id') id: string) {
    return await this.departementService.findSalles(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour un département' })
  @ApiParam({ name: 'id', description: 'ID du département' })
  @ApiResponse({ status: 200, description: 'Département mis à jour' })
  @ApiResponse({ status: 404, description: 'Département non trouvé' })
  @ApiResponse({ status: 409, description: 'Conflit (nom ou code déjà existant)' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDepartementDto,
  ) {
    return await this.departementService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprime un département' })
  @ApiParam({ name: 'id', description: 'ID du département' })
  @ApiResponse({ status: 204, description: 'Département supprimé' })
  @ApiResponse({ status: 404, description: 'Département non trouvé' })
  @ApiResponse({ status: 409, description: 'Impossible de supprimer (salles associées)' })
  async remove(@Param('id') id: string) {
    await this.departementService.remove(id);
  }
}

