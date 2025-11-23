import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { EnseignantService } from '../services/enseignant.service';
import { CreateEnseignantDto } from '../dto/create-enseignant.dto';

/**
 * Controller pour la gestion des enseignants
 */
@ApiTags('Enseignants')
@Controller('enseignants')
export class EnseignantController {
  constructor(private readonly enseignantService: EnseignantService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel enseignant' })
  @ApiResponse({ status: 201, description: 'Enseignant créé avec succès' })
  @ApiResponse({ status: 409, description: 'Conflit (email ou numéro employé déjà existant)' })
  async create(@Body() createDto: CreateEnseignantDto) {
    return await this.enseignantService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retourne tous les enseignants' })
  @ApiResponse({ status: 200, description: 'Liste des enseignants' })
  async findAll() {
    return await this.enseignantService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retourne un enseignant par son ID utilisateur' })
  @ApiParam({ name: 'id', description: 'ID utilisateur de l\'enseignant' })
  @ApiResponse({ status: 200, description: 'Détails de l\'enseignant' })
  @ApiResponse({ status: 404, description: 'Enseignant non trouvé' })
  async findOne(@Param('id') id: string) {
    return await this.enseignantService.findOne(id);
  }
}

