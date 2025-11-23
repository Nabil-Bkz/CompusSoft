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
import { SalleService } from '../services/salle.service';
import { CreateSalleDto } from '../dto/create-salle.dto';
import { UpdateSalleDto } from '../dto/update-salle.dto';

/**
 * Controller pour la gestion des salles
 */
@ApiTags('Salles')
@Controller('salles')
export class SalleController {
  constructor(private readonly salleService: SalleService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle salle' })
  @ApiResponse({ status: 201, description: 'Salle créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(@Body() createDto: CreateSalleDto) {
    return await this.salleService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retourne toutes les salles' })
  @ApiResponse({ status: 200, description: 'Liste des salles' })
  async findAll() {
    return await this.salleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retourne une salle par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la salle' })
  @ApiResponse({ status: 200, description: 'Détails de la salle' })
  @ApiResponse({ status: 404, description: 'Salle non trouvée' })
  async findOne(@Param('id') id: string) {
    return await this.salleService.findOne(id);
  }

  @Get(':id/logiciels')
  @ApiOperation({ summary: 'Retourne les logiciels installés dans une salle' })
  @ApiParam({ name: 'id', description: 'ID de la salle' })
  @ApiResponse({ status: 200, description: 'Liste des logiciels installés' })
  @ApiResponse({ status: 404, description: 'Salle non trouvée' })
  async findLogicielsInstalles(@Param('id') id: string) {
    return await this.salleService.findLogicielsInstalles(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour une salle' })
  @ApiParam({ name: 'id', description: 'ID de la salle' })
  @ApiResponse({ status: 200, description: 'Salle mise à jour' })
  @ApiResponse({ status: 404, description: 'Salle non trouvée' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateSalleDto) {
    return await this.salleService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprime une salle' })
  @ApiParam({ name: 'id', description: 'ID de la salle' })
  @ApiResponse({ status: 204, description: 'Salle supprimée' })
  @ApiResponse({ status: 404, description: 'Salle non trouvée' })
  async remove(@Param('id') id: string) {
    await this.salleService.remove(id);
  }
}

