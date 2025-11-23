import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Departement } from '../entities/departement.entity';
import { CreateDepartementDto } from '../dto/create-departement.dto';
import { UpdateDepartementDto } from '../dto/update-departement.dto';
import { AggregateNotFoundException } from '../../../common/exceptions/aggregate-not-found.exception';

/**
 * Service pour la gestion des départements
 */
@Injectable()
export class DepartementService {
  constructor(
    @InjectRepository(Departement)
    private readonly departementRepository: Repository<Departement>,
  ) {}

  /**
   * Crée un nouveau département
   */
  async create(createDto: CreateDepartementDto): Promise<Departement> {
    // Vérifier unicité du nom
    const existingByName = await this.departementRepository.findOne({
      where: { nom: createDto.nom },
    });
    if (existingByName) {
      throw new ConflictException(
        `Un département avec le nom "${createDto.nom}" existe déjà`,
      );
    }

    // Vérifier unicité du code
    const existingByCode = await this.departementRepository.findOne({
      where: { code: createDto.code },
    });
    if (existingByCode) {
      throw new ConflictException(
        `Un département avec le code "${createDto.code}" existe déjà`,
      );
    }

    const departement = this.departementRepository.create(createDto);
    return await this.departementRepository.save(departement);
  }

  /**
   * Retourne tous les départements
   */
  async findAll(): Promise<Departement[]> {
    return await this.departementRepository.find({
      relations: ['salles'],
      order: { nom: 'ASC' },
    });
  }

  /**
   * Retourne un département par son ID
   */
  async findOne(id: string): Promise<Departement> {
    const departement = await this.departementRepository.findOne({
      where: { id },
      relations: ['salles'],
    });

    if (!departement) {
      throw new AggregateNotFoundException('Département', id);
    }

    return departement;
  }

  /**
   * Met à jour un département
   */
  async update(
    id: string,
    updateDto: UpdateDepartementDto,
  ): Promise<Departement> {
    const departement = await this.findOne(id);

    // Vérifier unicité du nom si modifié
    if (updateDto.nom && updateDto.nom !== departement.nom) {
      const existing = await this.departementRepository.findOne({
        where: { nom: updateDto.nom },
      });
      if (existing) {
        throw new ConflictException(
          `Un département avec le nom "${updateDto.nom}" existe déjà`,
        );
      }
    }

    // Vérifier unicité du code si modifié
    if (updateDto.code && updateDto.code !== departement.code) {
      const existing = await this.departementRepository.findOne({
        where: { code: updateDto.code },
      });
      if (existing) {
        throw new ConflictException(
          `Un département avec le code "${updateDto.code}" existe déjà`,
        );
      }
    }

    Object.assign(departement, updateDto);
    return await this.departementRepository.save(departement);
  }

  /**
   * Supprime un département
   */
  async remove(id: string): Promise<void> {
    const departement = await this.findOne(id);

    // Vérifier s'il y a des salles associées
    const salles = departement.obtenirSalles();
    if (salles.length > 0) {
      throw new ConflictException(
        `Impossible de supprimer le département car il possède ${salles.length} salle(s)`,
      );
    }

    await this.departementRepository.remove(departement);
  }

  /**
   * Retourne les salles d'un département
   */
  async findSalles(departementId: string) {
    const departement = await this.findOne(departementId);
    return departement.obtenirSalles();
  }
}

