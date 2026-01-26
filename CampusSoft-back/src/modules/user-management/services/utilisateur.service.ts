import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Utilisateur } from '../entities/utilisateur.entity';
import { CreateUtilisateurDto } from '../dto/create-utilisateur.dto';
import { UpdateUtilisateurDto } from '../dto/update-utilisateur.dto';
import { AggregateNotFoundException } from '../../../common/exceptions/aggregate-not-found.exception';
import { UserRole } from '../../../common/value-objects/user-role.vo';

/**
 * Service pour la gestion des utilisateurs
 */
@Injectable()
export class UtilisateurService {
  constructor(
    @InjectRepository(Utilisateur)
    private readonly utilisateurRepository: Repository<Utilisateur>,
  ) {}

  /**
   * Crée un nouvel utilisateur
   */
  async create(createDto: CreateUtilisateurDto): Promise<Utilisateur> {
    const existing = await this.utilisateurRepository.findOne({
      where: { email: createDto.email },
    });

    if (existing) {
      throw new ConflictException(
        `Un utilisateur avec l'email "${createDto.email}" existe déjà`,
      );
    }

    const utilisateur = this.utilisateurRepository.create(createDto);

    if (createDto.password) {
      utilisateur.password = await bcrypt.hash(createDto.password, 10);
    }

    return await this.utilisateurRepository.save(utilisateur);
  }

  /**
   * Retourne tous les utilisateurs
   */
  async findAll(actif?: boolean): Promise<Utilisateur[]> {
    const where: any = {};
    if (actif !== undefined) {
      where.actif = actif;
    }

    return await this.utilisateurRepository.find({
      where,
      relations: ['enseignant', 'serviceInformatique', 'administrateur'],
      order: { nom: 'ASC', prenom: 'ASC' },
    });
  }

  /**
   * Retourne un utilisateur par son ID
   */
  async findOne(id: string): Promise<Utilisateur> {
    const utilisateur = await this.utilisateurRepository.findOne({
      where: { id },
      relations: ['enseignant', 'serviceInformatique', 'administrateur'],
    });

    if (!utilisateur) {
      throw new AggregateNotFoundException('Utilisateur', id);
    }

    return utilisateur;
  }

  /**
   * Retourne un utilisateur par email
   */
  async findByEmail(email: string): Promise<Utilisateur | null> {
    return await this.utilisateurRepository.findOne({
      where: { email },
      relations: ['enseignant', 'serviceInformatique', 'administrateur'],
    });
  }

  /**
   * Met à jour un utilisateur
   */
  async update(
    id: string,
    updateDto: UpdateUtilisateurDto,
  ): Promise<Utilisateur> {
    const utilisateur = await this.findOne(id);

    if (updateDto.email && updateDto.email !== utilisateur.email) {
      const existing = await this.utilisateurRepository.findOne({
        where: { email: updateDto.email },
      });

      if (existing) {
        throw new ConflictException(
          `Un utilisateur avec l'email "${updateDto.email}" existe déjà`,
        );
      }
    }

    if (updateDto.password) {
      utilisateur.password = await bcrypt.hash(updateDto.password, 10);
      delete updateDto.password;
    }

    Object.assign(utilisateur, updateDto);
    return await this.utilisateurRepository.save(utilisateur);
  }

  /**
   * Soft delete
   */
  async remove(id: string): Promise<void> {
    const utilisateur = await this.findOne(id);
    utilisateur.actif = false;
    await this.utilisateurRepository.save(utilisateur);
  }

  /**
   * Enseignants actifs
   */
  async findEnseignants(): Promise<Utilisateur[]> {
    return await this.utilisateurRepository.find({
      where: { role: UserRole.ENSEIGNANT, actif: true },
      relations: ['enseignant'],
      order: { nom: 'ASC', prenom: 'ASC' },
    });
  }

  /**
   * Service informatique actifs
   */
  async findServiceInformatique(): Promise<Utilisateur[]> {
    return await this.utilisateurRepository.find({
      where: { role: UserRole.SERVICE_INFORMATIQUE, actif: true },
      relations: ['serviceInformatique'],
      order: { nom: 'ASC', prenom: 'ASC' },
    });
  }
}