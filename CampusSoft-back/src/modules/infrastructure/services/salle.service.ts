import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Salle } from '../entities/salle.entity';
import { Departement } from '../entities/departement.entity';
import { CreateSalleDto } from '../dto/create-salle.dto';
import { UpdateSalleDto } from '../dto/update-salle.dto';
import { AggregateNotFoundException } from '../../../common/exceptions/aggregate-not-found.exception';
import { BusinessRuleViolationException } from '../../../common/exceptions/business-rule-violation.exception';
import { RoomType } from '../../../common/value-objects/room-type.vo';
import { Logiciel } from '@/modules/software-catalog/entities/logiciel.entity';

/**
 * Service pour la gestion des salles
 */
@Injectable()
export class SalleService {
  constructor(
    @InjectRepository(Salle)
    private readonly salleRepository: Repository<Salle>,
    @InjectRepository(Departement)
    private readonly departementRepository: Repository<Departement>,
    @InjectRepository(Logiciel)
    private readonly logicielRepository: Repository<Logiciel>,
  ) {}

  /**
   * Crée une nouvelle salle
   */
  async create(createDto: CreateSalleDto): Promise<Salle> {
    // Valider les règles métier
    if (createDto.type === RoomType.DEPARTEMENT && !createDto.departementId) {
      throw new BusinessRuleViolationException(
        'Une salle de type département doit avoir un département associé',
      );
    }

    if (createDto.type === RoomType.MUTUALISEE && createDto.departementId) {
      throw new BusinessRuleViolationException(
        'Une salle mutualisée ne peut pas avoir de département associé',
      );
    }

    // Vérifier que le département existe si fourni
    if (createDto.departementId) {
      const departement = await this.departementRepository.findOne({
        where: { id: createDto.departementId },
      });
      if (!departement) {
        throw new AggregateNotFoundException(
          'Département',
          createDto.departementId,
        );
      }
    }

    const salle = this.salleRepository.create(createDto);
    if (createDto.logicielIds && createDto.logicielIds.length > 0) {
      const logiciels = await this.logicielRepository.findBy({
        id: In(createDto.logicielIds),
      });

      if (logiciels.length !== createDto.logicielIds.length) {
        throw new BusinessRuleViolationException('Un ou plusieurs logiciels sont introuvables');
      } 

      salle.logiciels = logiciels;
    }
    return await this.salleRepository.save(salle);
  }

  /**
   * Retourne toutes les salles
   */
  async findAll(): Promise<Salle[]> {
    return await this.salleRepository.find({
      relations: ['departement', 'logiciels'],
      order: { nom: 'ASC' },
    });
  }

  /**
   * Retourne une salle par son ID
   */
  async findOne(id: string): Promise<Salle> {
    const salle = await this.salleRepository.findOne({
      where: { id },
      relations: ['departement', 'logiciels'],
    });

    if (!salle) {
      throw new AggregateNotFoundException('Salle', id);
    }

    return salle;
  }

  /**
   * Met à jour une salle
   */
  async update(id: string, updateDto: UpdateSalleDto): Promise<Salle> {
    const salle = await this.salleRepository.findOne({
      where: { id },
      relations: ['logiciels'], 
    });

    if (!salle) {
      throw new AggregateNotFoundException('Salle', id);
    }

    // Valider les règles métier si le type change
    if (updateDto.type !== undefined) {
      if (
        updateDto.type === RoomType.DEPARTEMENT &&
        !updateDto.departementId &&
        !salle.departementId
      ) {
        throw new BusinessRuleViolationException(
          'Une salle de type département doit avoir un département associé',
        );
      }

      if (
        updateDto.type === RoomType.MUTUALISEE &&
        (updateDto.departementId || salle.departementId)
      ) {
        throw new BusinessRuleViolationException(
          'Une salle mutualisée ne peut pas avoir de département associé',
        );
      }
    }

    if (updateDto.logicielIds) {
      const logiciels = await this.logicielRepository.findBy({
        id: In(updateDto.logicielIds),
      });

      if (logiciels.length !== updateDto.logicielIds.length) {
        throw new BusinessRuleViolationException('Un ou plusieurs logiciels sont introuvables');
      }
      
      salle.logiciels = logiciels;
    }

    const { logicielIds, ...simpleProps } = updateDto;
    Object.assign(salle, simpleProps);
    return await this.salleRepository.save(salle);
  }

  /**
   * Supprime une salle
   */
  async remove(id: string): Promise<void> {
    const salle = await this.findOne(id);
    await this.salleRepository.remove(salle);
  }

  /**
   * Retourne les logiciels installés dans une salle
   */
  async findLogicielsInstalles(salleId: string): Promise<any[]> {
    const salle = await this.salleRepository.findOne({
      where: { id: salleId },
      relations: ['logiciels'],
    });

    if (!salle) {
      throw new AggregateNotFoundException('Salle', salleId);
    }

    return salle.logiciels;
  }
}
