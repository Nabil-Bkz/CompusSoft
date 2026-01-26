import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Logiciel } from '../entities/logiciel.entity';
import { CreateLogicielDto } from '../dto/create-logiciel.dto';
import { UpdateLogicielDto } from '../dto/update-logiciel.dto';
import { AggregateNotFoundException } from '../../../common/exceptions/aggregate-not-found.exception';
import { BusinessRuleViolationException } from '../../../common/exceptions/business-rule-violation.exception';
import { SoftwareVersion } from '../../../common/value-objects/software-version.vo';
import { DemandeLogiciel } from '../../request-management/entities/demande-logiciel.entity';
import { DemandeLogicielSalle } from '../../request-management/entities/demande-logiciel-salle.entity';
import { Salle } from '../../infrastructure/entities/salle.entity';

/**
 * Service pour la gestion des logiciels
 */
@Injectable()
export class LogicielService {
  constructor(
    @InjectRepository(Logiciel)
    private readonly logicielRepository: Repository<Logiciel>,
    @InjectRepository(DemandeLogiciel)
    private readonly demandeLogicielRepository: Repository<DemandeLogiciel>,
    @InjectRepository(DemandeLogicielSalle)
    private readonly demandeLogicielSalleRepository: Repository<DemandeLogicielSalle>,
    @InjectRepository(Salle)
    private readonly salleRepository: Repository<Salle>,
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
   * Vérifie à la fois la relation ManyToMany directe et les DemandeLogicielSalle
   */
  async estInstalleDans(salleId: string, logicielId: string): Promise<boolean> {
    await this.findOne(logicielId); // Vérifier que le logiciel existe

    // 1. Vérifier dans la relation ManyToMany directe (salle_logiciels)
    const salleAvecLogiciel = await this.salleRepository
      .createQueryBuilder('salle')
      .innerJoin('salle.logiciels', 'logiciel')
      .where('salle.id = :salleId', { salleId })
      .andWhere('logiciel.id = :logicielId', { logicielId })
      .getOne();

    if (salleAvecLogiciel) {
      return true;
    }

    // 2. Vérifier dans les DemandeLogicielSalle
    const demandeLogiciels = await this.demandeLogicielRepository.find({
      where: { logicielId },
      select: ['id'],
    });

    if (demandeLogiciels.length === 0) {
      return false;
    }

    const demandeLogicielIds = demandeLogiciels.map((dl) => dl.id);

    // Vérifier si une installation existe pour cette salle avec estInstallee = true
    const installation = await this.demandeLogicielSalleRepository.findOne({
      where: {
        demandeLogicielId: In(demandeLogicielIds),
        salleId,
        estInstallee: true,
      },
    });

    return !!installation;
  }

  /**
   * Retourne les salles où un logiciel est installé
   * Utilise la relation ManyToMany directe (salle_logiciels) et les DemandeLogicielSalle
   */
  async findSallesInstallation(logicielId: string): Promise<Salle[]> {
    await this.findOne(logicielId); // Vérifier que le logiciel existe

    const sallesUniques = new Map<string, Salle>();

    // 1. Chercher dans la relation ManyToMany directe (salle_logiciels)
    // Cette relation est utilisée par l'API /api/salles/:id/logiciels
    const sallesAvecLogiciel = await this.salleRepository
      .createQueryBuilder('salle')
      .innerJoin('salle.logiciels', 'logiciel')
      .where('logiciel.id = :logicielId', { logicielId })
      .leftJoinAndSelect('salle.departement', 'departement')
      .getMany();

    // Ajouter les salles de la relation ManyToMany
    for (const salle of sallesAvecLogiciel) {
      if (!sallesUniques.has(salle.id)) {
        sallesUniques.set(salle.id, salle);
      }
    }

    // 2. Chercher aussi dans les DemandeLogicielSalle où estInstallee = true
    // Pour inclure les installations via le système de demandes
    const demandeLogiciels = await this.demandeLogicielRepository.find({
      where: { logicielId },
      select: ['id'],
    });

    if (demandeLogiciels.length > 0) {
      const demandeLogicielIds = demandeLogiciels.map((dl) => dl.id);

      const installations = await this.demandeLogicielSalleRepository.find({
        where: {
          demandeLogicielId: In(demandeLogicielIds),
          estInstallee: true,
        },
        relations: ['salle', 'salle.departement'],
      });

      // Ajouter les salles des installations
      for (const installation of installations) {
        if (installation.salle && !sallesUniques.has(installation.salle.id)) {
          sallesUniques.set(installation.salle.id, installation.salle);
        }
      }
    }

    return Array.from(sallesUniques.values());
  }
}

