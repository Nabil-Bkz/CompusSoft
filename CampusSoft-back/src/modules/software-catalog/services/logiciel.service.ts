import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Logiciel } from '../entities/logiciel.entity';
import { CreateLogicielDto } from '../dto/create-logiciel.dto';
import { UpdateLogicielDto } from '../dto/update-logiciel.dto';
import { AggregateNotFoundException } from '../../../common/exceptions/aggregate-not-found.exception';
import { BusinessRuleViolationException } from '../../../common/exceptions/business-rule-violation.exception';
import { SoftwareVersion } from '../../../common/value-objects/software-version.vo';

/**
 * Service pour la gestion des logiciels
 */
@Injectable()
export class LogicielService {
  constructor(
    @InjectRepository(Logiciel)
    private readonly logicielRepository: Repository<Logiciel>,
  ) {}

  /**
   * Crée un nouveau logiciel
   */
  async create(createDto: CreateLogicielDto): Promise<Logiciel> {
    // Valider la version
    try {
      SoftwareVersion.fromString(createDto.version);
    } catch (error) {
      throw new BusinessRuleViolationException(
        `Format de version invalide: ${createDto.version}. Format attendu: major.minor.patch`,
      );
    }

    // Valider la durée maximale (max 1 an = 365 jours)
    const dureeMax = createDto.dureeMax || 365;
    if (dureeMax > 365) {
      throw new BusinessRuleViolationException(
        'La durée maximale ne peut pas dépasser 365 jours (1 an)',
      );
    }

    // Vérifier unicité nom + version
    const existing = await this.logicielRepository.findOne({
      where: {
        nom: createDto.nom,
        version: createDto.version,
      },
    });
    if (existing) {
      throw new ConflictException(
        `Un logiciel "${createDto.nom}" version "${createDto.version}" existe déjà`,
      );
    }

    const logiciel = this.logicielRepository.create(createDto);
    return await this.logicielRepository.save(logiciel);
  }

  /**
   * Retourne tous les logiciels (avec filtres optionnels)
   */
  async findAll(
    search?: string,
    actif?: boolean,
  ): Promise<Logiciel[]> {
    const where: any = {};

    if (search) {
      where.nom = Like(`%${search}%`);
    }

    if (actif !== undefined) {
      where.actif = actif;
    }

    return await this.logicielRepository.find({
      where,
      order: { nom: 'ASC', dateAjout: 'DESC' },
    });
  }

  /**
   * Retourne un logiciel par son ID
   */
  async findOne(id: string): Promise<Logiciel> {
    const logiciel = await this.logicielRepository.findOne({
      where: { id },
    });

    if (!logiciel) {
      throw new AggregateNotFoundException('Logiciel', id);
    }

    return logiciel;
  }

  /**
   * Met à jour un logiciel
   */
  async update(
    id: string,
    updateDto: UpdateLogicielDto,
  ): Promise<Logiciel> {
    const logiciel = await this.findOne(id);

    // Valider la version si modifiée
    if (updateDto.version && updateDto.version !== logiciel.version) {
      try {
        SoftwareVersion.fromString(updateDto.version);
      } catch (error) {
        throw new BusinessRuleViolationException(
          `Format de version invalide: ${updateDto.version}. Format attendu: major.minor.patch`,
        );
      }

      // Vérifier unicité nom + version si version modifiée
      const existing = await this.logicielRepository.findOne({
        where: {
          nom: logiciel.nom,
          version: updateDto.version,
        },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Un logiciel "${logiciel.nom}" version "${updateDto.version}" existe déjà`,
        );
      }
    }

    // Valider la durée maximale si modifiée
    if (updateDto.dureeMax !== undefined) {
      if (updateDto.dureeMax > 365) {
        throw new BusinessRuleViolationException(
          'La durée maximale ne peut pas dépasser 365 jours (1 an)',
        );
      }
    }

    Object.assign(logiciel, updateDto);
    return await this.logicielRepository.save(logiciel);
  }

  /**
   * Supprime un logiciel (soft delete)
   */
  async remove(id: string): Promise<void> {
    const logiciel = await this.findOne(id);
    logiciel.actif = false;
    await this.logicielRepository.save(logiciel);
  }

  /**
   * Vérifie si un logiciel est installé dans une salle
   * (À implémenter quand le module Request Management sera prêt)
   */
  async estInstalleDans(salleId: string, logicielId: string): Promise<boolean> {
    await this.findOne(logicielId); // Vérifier que le logiciel existe
    // TODO: Implémenter quand DemandeLogicielSalle sera disponible
    return false;
  }

  /**
   * Retourne les salles où un logiciel est installé
   * (À implémenter quand le module Request Management sera prêt)
   */
  async findSallesInstallation(logicielId: string): Promise<any[]> {
    await this.findOne(logicielId); // Vérifier que le logiciel existe
    // TODO: Implémenter quand DemandeLogicielSalle sera disponible
    return [];
  }
}

