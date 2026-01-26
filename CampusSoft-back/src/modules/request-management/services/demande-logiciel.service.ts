import {
  Injectable,
  Inject,
  forwardRef,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DemandeLogiciel } from '../entities/demande-logiciel.entity';
import { DemandeLogicielSalle } from '../entities/demande-logiciel-salle.entity';
import { Demande } from '../entities/demande.entity';
import { AggregateNotFoundException } from '../../../common/exceptions/aggregate-not-found.exception';
import { BusinessRuleViolationException } from '../../../common/exceptions/business-rule-violation.exception';
import { InstallationSyncService } from './installation-sync.service';
import { DemandeLogicielFilterDto } from '../dto/demande-logiciel-filter.dto';
import { MarquerInstalleDemandeLogicielDto } from '../dto/marquer-installe-demande-logiciel.dto';
import { UpdateDemandeLogicielInstallationDto } from '../dto/update-demande-logiciel-installation.dto';
import { TypeActionHistorique } from '../../history/entities/historique.entity';
import { SoftwareInstallationStatus } from '../../../common/value-objects/software-installation-status.vo';

/**
 * Service pour la gestion des demande logiciels
 */
@Injectable()
export class DemandeLogicielService {
  constructor(
    @InjectRepository(DemandeLogiciel)
    private readonly demandeLogicielRepository: Repository<DemandeLogiciel>,
    @InjectRepository(DemandeLogicielSalle)
    private readonly demandeLogicielSalleRepository: Repository<DemandeLogicielSalle>,
    @InjectRepository(Demande)
    private readonly demandeRepository: Repository<Demande>,
    private readonly dataSource: DataSource,
    private readonly installationSyncService: InstallationSyncService,
    @Inject(forwardRef(() => 'HistoriqueService'))
    @Optional()
    private readonly historiqueService?: any, // Optional pour éviter les erreurs de circularité
  ) {}

  /**
   * Retourne tous les demande logiciels avec filtres optionnels
   */
  async findAll(
    filters: DemandeLogicielFilterDto = {},
  ): Promise<DemandeLogiciel[]> {
    const queryBuilder = this.demandeLogicielRepository
      .createQueryBuilder('dl')
      .leftJoinAndSelect('dl.logiciel', 'logiciel')
      .leftJoinAndSelect('dl.demande', 'demande')
      .leftJoinAndSelect('dl.demandeLogicielSalles', 'dls')
      .leftJoinAndSelect('dls.salle', 'salle');

    if (filters.demandeId) {
      queryBuilder.andWhere('dl.demandeId = :demandeId', {
        demandeId: filters.demandeId,
      });
    }

    if (filters.logicielId) {
      queryBuilder.andWhere('dl.logicielId = :logicielId', {
        logicielId: filters.logicielId,
      });
    }

    if (filters.statutInstallation) {
      queryBuilder.andWhere('dl.statutInstallation = :statutInstallation', {
        statutInstallation: filters.statutInstallation,
      });
    }

    // Pagination
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;
    queryBuilder.take(limit).skip(offset);

    // Tri par date de création (plus récent en premier)
    queryBuilder.orderBy('dl.dateCreation', 'DESC');

    return await queryBuilder.getMany();
  }

  /**
   * Retourne un demande logiciel par son ID avec toutes les relations
   */
  async findOne(id: string): Promise<DemandeLogiciel> {
    const demandeLogiciel = await this.demandeLogicielRepository.findOne({
      where: { id },
      relations: ['logiciel', 'demande', 'demandeLogicielSalles', 'demandeLogicielSalles.salle'],
    });

    if (!demandeLogiciel) {
      throw new AggregateNotFoundException('DemandeLogiciel', id);
    }

    return demandeLogiciel;
  }

  /**
   * Marque un demande logiciel comme installé et met à jour toutes les salles associées
   */
  async marquerInstalle(
    id: string,
    dto: MarquerInstalleDemandeLogicielDto,
  ): Promise<DemandeLogiciel> {
    // Vérifier que le DemandeLogiciel existe
    const demandeLogiciel = await this.demandeLogicielRepository.findOne({
      where: { id },
      relations: ['logiciel', 'demande'],
    });

    if (!demandeLogiciel) {
      throw new AggregateNotFoundException('DemandeLogiciel', id);
    }

    // Charger toutes les salles associées
    const allDLS = await this.demandeLogicielSalleRepository.find({
      where: { demandeLogicielId: id },
      relations: ['salle'],
    });

    if (allDLS.length === 0) {
      throw new BusinessRuleViolationException(
        'Aucune salle associée à ce demande logiciel',
      );
    }

    // Date d'installation (utiliser celle fournie ou la date actuelle)
    const dateInstallation = dto.dateInstallation
      ? new Date(dto.dateInstallation)
      : new Date();

    // Sauvegarder avec transaction pour garantir la cohérence
    return await this.dataSource.transaction(async (manager) => {
      const dlRepo = manager.getRepository(DemandeLogiciel);
      const dlsRepo = manager.getRepository(DemandeLogicielSalle);
      const demandeRepo = manager.getRepository(Demande);

      // Sauvegarder l'ancien statut pour l'historique
      const ancienStatutDL = demandeLogiciel.statutInstallation;
      const ancienEtatDemande = demandeLogiciel.demande?.etat;

      // Marquer toutes les salles comme installées
      for (const dls of allDLS) {
        dls.marquerInstallee(dateInstallation, dto.commentaire);
        await dlsRepo.save(dls);
      }

      // Mettre à jour le DemandeLogiciel
      demandeLogiciel.dateInstallation = dateInstallation;
      demandeLogiciel.dateChangement = new Date();
      if (dto.commentaire) {
        demandeLogiciel.commentaire = dto.commentaire;
      }

      // Sauvegarder le DemandeLogiciel
      const savedDL = await dlRepo.save(demandeLogiciel);

      // Recalculer le statut d'installation (devrait être TOUS_INSTALLES maintenant)
      await this.installationSyncService.recalculerStatutInstallation(
        id,
        dlRepo,
        dlsRepo,
      );

      // Recharger pour obtenir le nouveau statut
      const demandeLogicielMisAJour = await dlRepo.findOne({
        where: { id },
        relations: ['logiciel'],
      });

      // Vérifier et mettre à jour l'état de la demande globale
      await this.installationSyncService.verifierEtatDemande(
        demandeLogiciel.demandeId,
        dlRepo,
        demandeRepo,
      );

      // Recharger la demande pour obtenir le nouvel état
      const demandeMisAJour = await demandeRepo.findOne({
        where: { id: demandeLogiciel.demandeId },
      });

      // Enregistrer dans l'historique (non bloquant)
      if (this.historiqueService && demandeLogicielMisAJour) {
        const commentaireHistorique =
          `Installation dans toutes les salles (${allDLS.length} salle(s)). ` +
          `Statut logiciel: ${ancienStatutDL} → ${demandeLogicielMisAJour.statutInstallation}` +
          (ancienEtatDemande !== demandeMisAJour?.etat
            ? `. État demande: ${ancienEtatDemande} → ${demandeMisAJour?.etat}`
            : '') +
          (dto.commentaire ? `. Commentaire: ${dto.commentaire}` : '');

        this.enregistrerHistorique({
          demandeId: demandeLogiciel.demandeId,
          demandeLogicielId: id,
          logicielId: demandeLogiciel.logicielId,
          utilisateurId: 'system', // Service informatique - TODO: utiliser l'ID réel
          typeAction: TypeActionHistorique.INSTALLATION,
          ancienStatutInstallation: ancienStatutDL,
          nouveauStatutInstallation: demandeLogicielMisAJour.statutInstallation,
          commentaire: commentaireHistorique,
        });
      }

      // Recharger avec toutes les relations pour la réponse
      return await dlRepo.findOne({
        where: { id },
        relations: ['logiciel', 'demande', 'demandeLogicielSalles', 'demandeLogicielSalles.salle'],
      });
    });
  }

  /**
   * Met à jour l'installation d'un demande logiciel
   * Si le statut est TOUS_INSTALLES, marque toutes les salles comme installées
   * Met automatiquement à jour le statut de la demande si tous les logiciels sont installés
   */
  async updateInstallation(
    id: string,
    dto: UpdateDemandeLogicielInstallationDto,
  ): Promise<DemandeLogiciel> {
    // Vérifier que le DemandeLogiciel existe
    const demandeLogiciel = await this.demandeLogicielRepository.findOne({
      where: { id },
      relations: ['logiciel', 'demande'],
    });

    if (!demandeLogiciel) {
      throw new AggregateNotFoundException('DemandeLogiciel', id);
    }

    // Sauvegarder avec transaction pour garantir la cohérence
    return await this.dataSource.transaction(async (manager) => {
      const dlRepo = manager.getRepository(DemandeLogiciel);
      const dlsRepo = manager.getRepository(DemandeLogicielSalle);
      const demandeRepo = manager.getRepository(Demande);

      // Sauvegarder l'ancien statut pour l'historique
      const ancienStatutDL = demandeLogiciel.statutInstallation;
      const ancienEtatDemande = demandeLogiciel.demande?.etat;

      // Mettre à jour le statut d'installation si fourni
      if (dto.statutInstallation !== undefined) {
        demandeLogiciel.statutInstallation = dto.statutInstallation;
        demandeLogiciel.dateChangement = new Date();

        // Si le statut est TOUS_INSTALLES, marquer toutes les salles comme installées
        if (dto.statutInstallation === SoftwareInstallationStatus.TOUS_INSTALLES) {
          const allDLS = await dlsRepo.find({
            where: { demandeLogicielId: id },
            relations: ['salle'],
          });

          const dateInstallation = dto.dateInstallation
            ? new Date(dto.dateInstallation)
            : new Date();

          for (const dls of allDLS) {
            if (!dls.estInstallee) {
              dls.marquerInstallee(dateInstallation, dto.commentaire);
              await dlsRepo.save(dls);
            }
          }

          // Mettre à jour la date d'installation du DemandeLogiciel
          if (!demandeLogiciel.dateInstallation) {
            demandeLogiciel.dateInstallation = dateInstallation;
          }
        }
      }

      // Mettre à jour la date d'installation si fournie
      if (dto.dateInstallation) {
        demandeLogiciel.dateInstallation = new Date(dto.dateInstallation);
      }

      // Mettre à jour le commentaire si fourni
      if (dto.commentaire !== undefined) {
        demandeLogiciel.commentaire = dto.commentaire;
      }

      // Sauvegarder le DemandeLogiciel
      const savedDL = await dlRepo.save(demandeLogiciel);

      // Recalculer le statut d'installation basé sur les salles (si le statut n'a pas été fourni explicitement)
      if (dto.statutInstallation === undefined) {
        await this.installationSyncService.recalculerStatutInstallation(
          id,
          dlRepo,
          dlsRepo,
        );
      }

      // Recharger pour obtenir le nouveau statut
      const demandeLogicielMisAJour = await dlRepo.findOne({
        where: { id },
        relations: ['logiciel'],
      });

      // Vérifier et mettre à jour l'état de la demande globale
      // Cela mettra automatiquement la demande à INSTALLEE si tous les logiciels sont installés
      await this.installationSyncService.verifierEtatDemande(
        demandeLogiciel.demandeId,
        dlRepo,
        demandeRepo,
      );

      // Recharger la demande pour obtenir le nouvel état
      const demandeMisAJour = await demandeRepo.findOne({
        where: { id: demandeLogiciel.demandeId },
      });

      // Enregistrer dans l'historique (non bloquant)
      if (this.historiqueService && demandeLogicielMisAJour) {
        const commentaireHistorique =
          `Mise à jour installation. ` +
          `Statut logiciel: ${ancienStatutDL} → ${demandeLogicielMisAJour.statutInstallation}` +
          (ancienEtatDemande !== demandeMisAJour?.etat
            ? `. État demande: ${ancienEtatDemande} → ${demandeMisAJour?.etat}`
            : '') +
          (dto.commentaire ? `. Commentaire: ${dto.commentaire}` : '');

        this.enregistrerHistorique({
          demandeId: demandeLogiciel.demandeId,
          demandeLogicielId: id,
          logicielId: demandeLogiciel.logicielId,
          utilisateurId: 'system', // Service informatique - TODO: utiliser l'ID réel
          typeAction: TypeActionHistorique.CHANGEMENT_STATUT_INSTALLATION,
          ancienStatutInstallation: ancienStatutDL,
          nouveauStatutInstallation: demandeLogicielMisAJour.statutInstallation,
          commentaire: commentaireHistorique,
        });
      }

      // Recharger avec toutes les relations pour la réponse
      return await dlRepo.findOne({
        where: { id },
        relations: ['logiciel', 'demande', 'demandeLogicielSalles', 'demandeLogicielSalles.salle'],
      });
    });
  }

  /**
   * Enregistre une action dans l'historique (méthode privée)
   */
  private async enregistrerHistorique(data: {
    demandeId: string;
    demandeLogicielId?: string | null;
    logicielId: string;
    utilisateurId: string;
    typeAction: TypeActionHistorique;
    ancienStatutInstallation?: any;
    nouveauStatutInstallation?: any;
    commentaire?: string | null;
  }): Promise<void> {
    if (this.historiqueService) {
      try {
        await this.historiqueService.enregistrerAction(data);
      } catch (error) {
        // Ne pas bloquer le flux principal en cas d'erreur d'historique
        console.error('Erreur enregistrement historique:', error);
      }
    }
  }
}

