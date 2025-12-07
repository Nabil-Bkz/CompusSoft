import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere, In } from 'typeorm';
import { Historique, TypeActionHistorique } from '../entities/historique.entity';
import { HistoriqueFilterDto } from '../dto/historique-filter.dto';

/**
 * Service pour la gestion de l'historique
 */
@Injectable()
export class HistoriqueService {
  constructor(
    @InjectRepository(Historique)
    private readonly historiqueRepository: Repository<Historique>,
  ) {}

  /**
   * Enregistre une action dans l'historique
   */
  async enregistrerAction(data: {
    demandeId: string;
    demandeLogicielId?: string | null;
    logicielId: string;
    utilisateurId: string;
    typeAction: TypeActionHistorique;
    ancienEtat?: any;
    nouvelEtat?: any;
    ancienStatutInstallation?: any;
    nouveauStatutInstallation?: any;
    commentaire?: string | null;
  }): Promise<Historique> {
    const historiqueData = Historique.creerAction(data);
    const historique = this.historiqueRepository.create(historiqueData);
    return await this.historiqueRepository.save(historique);
  }

  /**
   * Retourne tous les historiques avec filtres
   */
  async findAll(filters: HistoriqueFilterDto = {}): Promise<Historique[]> {
    const where: FindOptionsWhere<Historique> = {};

    if (filters.demandeId) {
      where.demandeId = filters.demandeId;
    }
    if (filters.logicielId) {
      where.logicielId = filters.logicielId;
    }
    if (filters.utilisateurId) {
      where.utilisateurId = filters.utilisateurId;
    }
    if (filters.typeAction) {
      where.typeAction = filters.typeAction;
    }

    const queryBuilder = this.historiqueRepository
      .createQueryBuilder('historique')
      .where(where)
      .leftJoinAndSelect('historique.demande', 'demande')
      .leftJoinAndSelect('historique.logiciel', 'logiciel')
      .leftJoinAndSelect('historique.utilisateur', 'utilisateur')
      .leftJoinAndSelect('historique.demandeLogiciel', 'demandeLogiciel')
      .orderBy('historique.dateAction', 'DESC');

    if (filters.dateDebut || filters.dateFin) {
      const dateDebut = filters.dateDebut ? new Date(filters.dateDebut) : undefined;
      const dateFin = filters.dateFin ? new Date(filters.dateFin) : undefined;

      if (dateDebut && dateFin) {
        queryBuilder.andWhere('historique.dateAction BETWEEN :dateDebut AND :dateFin', {
          dateDebut,
          dateFin,
        });
      } else if (dateDebut) {
        queryBuilder.andWhere('historique.dateAction >= :dateDebut', { dateDebut });
      } else if (dateFin) {
        queryBuilder.andWhere('historique.dateAction <= :dateFin', { dateFin });
      }
    }

    if (filters.etat) {
      queryBuilder.andWhere(
        '(historique.ancienEtat = :etat OR historique.nouvelEtat = :etat)',
        { etat: filters.etat },
      );
    }

    return await queryBuilder.getMany();
  }

  /**
   * Retourne l'historique d'une demande
   */
  async findByDemandeId(demandeId: string): Promise<Historique[]> {
    return await this.historiqueRepository.find({
      where: { demandeId },
      relations: ['logiciel', 'utilisateur', 'demandeLogiciel'],
      order: { dateAction: 'DESC' },
    });
  }

  /**
   * Retourne l'historique d'un logiciel
   */
  async findByLogicielId(logicielId: string): Promise<Historique[]> {
    return await this.historiqueRepository.find({
      where: { logicielId },
      relations: ['demande', 'utilisateur'],
      order: { dateAction: 'DESC' },
    });
  }

  /**
   * Retourne l'historique d'un utilisateur
   */
  async findByUtilisateurId(utilisateurId: string): Promise<Historique[]> {
    return await this.historiqueRepository.find({
      where: { utilisateurId },
      relations: ['demande', 'logiciel'],
      order: { dateAction: 'DESC' },
    });
  }

  /**
   * Retourne les statistiques d'historique
   */
  async getStatistiques(
    dateDebut?: Date,
    dateFin?: Date,
  ): Promise<{
    totalActions: number;
    parTypeAction: Record<TypeActionHistorique, number>;
    parUtilisateur: Array<{ utilisateurId: string; count: number }>;
  }> {
    const queryBuilder = this.historiqueRepository.createQueryBuilder('historique');

    if (dateDebut || dateFin) {
      if (dateDebut && dateFin) {
        queryBuilder.where('historique.dateAction BETWEEN :dateDebut AND :dateFin', {
          dateDebut,
          dateFin,
        });
      } else if (dateDebut) {
        queryBuilder.where('historique.dateAction >= :dateDebut', { dateDebut });
      } else if (dateFin) {
        queryBuilder.where('historique.dateAction <= :dateFin', { dateFin });
      }
    }

    const totalActions = await queryBuilder.getCount();

    // Statistiques par type d'action
    const parTypeAction = await queryBuilder
      .select('historique.typeAction', 'typeAction')
      .addSelect('COUNT(*)', 'count')
      .groupBy('historique.typeAction')
      .getRawMany();

    const parTypeActionMap: Record<string, number> = {};
    Object.values(TypeActionHistorique).forEach((type) => {
      parTypeActionMap[type] = 0;
    });
    parTypeAction.forEach((item) => {
      parTypeActionMap[item.typeAction] = parseInt(item.count, 10);
    });

    // Statistiques par utilisateur
    const parUtilisateurRaw = await this.historiqueRepository
      .createQueryBuilder('historique')
      .select('historique.utilisateurId', 'utilisateurId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('historique.utilisateurId')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const parUtilisateur = parUtilisateurRaw.map((item) => ({
      utilisateurId: item.utilisateurId,
      count: parseInt(item.count, 10),
    }));

    return {
      totalActions,
      parTypeAction: parTypeActionMap as Record<TypeActionHistorique, number>,
      parUtilisateur,
    };
  }
}

