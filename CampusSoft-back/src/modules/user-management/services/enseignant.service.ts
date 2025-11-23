import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Utilisateur } from '../entities/utilisateur.entity';
import { Enseignant } from '../entities/enseignant.entity';
import { CreateEnseignantDto } from '../dto/create-enseignant.dto';
import { AggregateNotFoundException } from '../../../common/exceptions/aggregate-not-found.exception';
import { UserRole } from '../../../common/value-objects/user-role.vo';

/**
 * Service pour la gestion des enseignants
 */
@Injectable()
export class EnseignantService {
  constructor(
    @InjectRepository(Utilisateur)
    private readonly utilisateurRepository: Repository<Utilisateur>,
    @InjectRepository(Enseignant)
    private readonly enseignantRepository: Repository<Enseignant>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crée un nouvel enseignant (avec création de l'utilisateur associé)
   */
  async create(createDto: CreateEnseignantDto): Promise<Utilisateur> {
    // Vérifier unicité du numéro d'employé
    const existingNumero = await this.enseignantRepository.findOne({
      where: { numeroEmploye: createDto.numeroEmploye },
    });
    if (existingNumero) {
      throw new ConflictException(
        `Un enseignant avec le numéro d'employé "${createDto.numeroEmploye}" existe déjà`,
      );
    }

    // Utiliser une transaction pour créer utilisateur + enseignant
    return await this.dataSource.transaction(async (manager) => {
      // Créer l'utilisateur
      const utilisateurData = {
        email: createDto.email,
        nom: createDto.nom,
        prenom: createDto.prenom,
        ssoId: createDto.ssoId,
        role: UserRole.ENSEIGNANT,
        actif: createDto.actif ?? true,
      };

      const utilisateur = manager.getRepository(Utilisateur).create(utilisateurData);
      const savedUtilisateur = await manager
        .getRepository(Utilisateur)
        .save(utilisateur);

      // Créer l'enseignant
      const enseignantData = {
        utilisateurId: savedUtilisateur.id,
        numeroEmploye: createDto.numeroEmploye,
        bureau: createDto.bureau,
      };

      const enseignant = manager.getRepository(Enseignant).create(enseignantData);
      await manager.getRepository(Enseignant).save(enseignant);

      // Retourner l'utilisateur avec relation enseignant chargée
      return await manager.getRepository(Utilisateur).findOne({
        where: { id: savedUtilisateur.id },
        relations: ['enseignant'],
      });
    });
  }

  /**
   * Retourne tous les enseignants
   */
  async findAll(): Promise<Utilisateur[]> {
    return await this.utilisateurRepository.find({
      where: { role: UserRole.ENSEIGNANT },
      relations: ['enseignant'],
      order: { nom: 'ASC', prenom: 'ASC' },
    });
  }

  /**
   * Retourne un enseignant par son ID utilisateur
   */
  async findOne(utilisateurId: string): Promise<Utilisateur> {
    const utilisateur = await this.utilisateurRepository.findOne({
      where: { id: utilisateurId, role: UserRole.ENSEIGNANT },
      relations: ['enseignant'],
    });

    if (!utilisateur) {
      throw new AggregateNotFoundException('Enseignant', utilisateurId);
    }

    return utilisateur;
  }

  /**
   * Retourne un enseignant par son numéro d'employé
   */
  async findByNumeroEmploye(numeroEmploye: string): Promise<Utilisateur | null> {
    const enseignant = await this.enseignantRepository.findOne({
      where: { numeroEmploye },
      relations: ['utilisateur'],
    });

    return enseignant?.utilisateur || null;
  }
}

