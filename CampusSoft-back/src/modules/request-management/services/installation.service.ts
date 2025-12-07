import {
  Injectable,
  BadRequestException,
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
import { SoftwareInstallationStatus } from '../../../common/value-objects/software-installation-status.vo';
import { calculateInstallationStatus } from '../../../common/value-objects/software-installation-status.vo';
import { UpdateInstallationDto } from '../dto/update-installation.dto';
import { RequestStatus } from '../../../common/value-objects/request-status.vo';
import { TypeActionHistorique } from '../../history/entities/historique.entity';
import { InstallationSyncService } from './installation-sync.service';

/**
 * Service pour la gestion des installations (Service Informatique)
 */
@Injectable()
export class InstallationService {
  constructor(
    @InjectRepository(DemandeLogicielSalle)
    private readonly demandeLogicielSalleRepository: Repository<DemandeLogicielSalle>,
    @InjectRepository(DemandeLogiciel)
    private readonly demandeLogicielRepository: Repository<DemandeLogiciel>,
    @InjectRepository(Demande)
    private readonly demandeRepository: Repository<Demande>,
    private readonly dataSource: DataSource,
    private readonly installationSyncService: InstallationSyncService,
    @Inject(forwardRef(() => 'HistoriqueService'))
    @Optional()
    private readonly historiqueService?: any, // Optional pour éviter les erreurs de circularité
  ) {}

  /**
   * Met à jour le statut d'installation dans une salle spécifique
   */
  async mettreAJourInstallation(
    demandeId: string,
    demandeLogicielId: string,
    salleId: string,
    updateDto: UpdateInstallationDto,
  ): Promise<DemandeLogicielSalle> {
    // Vérifier que la demande existe
    const demande = await this.demandeRepository.findOne({
      where: { id: demandeId },
    });
    if (!demande) {
      throw new AggregateNotFoundException('Demande', demandeId);
    }

    // Vérifier que le DemandeLogiciel existe et appartient à la demande
    const demandeLogiciel = await this.demandeLogicielRepository.findOne({
      where: { id: demandeLogicielId, demandeId },
    });
    if (!demandeLogiciel) {
      throw new AggregateNotFoundException('DemandeLogiciel', demandeLogicielId);
    }

    // Trouver ou créer la DemandeLogicielSalle
    let demandeLogicielSalle = await this.demandeLogicielSalleRepository.findOne({
      where: {
        demandeLogicielId,
        salleId,
      },
      relations: ['salle'],
    });

    if (!demandeLogicielSalle) {
      // Créer une nouvelle assignation
      demandeLogicielSalle = this.demandeLogicielSalleRepository.create({
        demandeLogicielId,
        salleId,
        estInstallee: false,
      });
    }

    // Mettre à jour le statut
    const dateInstallation = updateDto.dateInstallation
      ? new Date(updateDto.dateInstallation)
      : updateDto.estInstallee
        ? new Date()
        : null;

    demandeLogicielSalle.mettreAJourStatut(
      updateDto.estInstallee,
      dateInstallation,
      updateDto.commentaire,
    );

    // Sauvegarder avec transaction pour mettre à jour le statut du DemandeLogiciel et de la Demande
    return await this.dataSource.transaction(async (manager) => {
      const dlsRepo = manager.getRepository(DemandeLogicielSalle);
      const dlRepo = manager.getRepository(DemandeLogiciel);
      const demandeRepo = manager.getRepository(Demande);

      // Sauvegarder la DemandeLogicielSalle mise à jour
      const savedDLS = await dlsRepo.save(demandeLogicielSalle);

      // 1. Recalculer le statut d'installation du DemandeLogiciel basé sur toutes les salles
      const ancienStatutDL = demandeLogiciel.statutInstallation;
      await this.installationSyncService.recalculerStatutInstallation(
        demandeLogicielId,
        dlRepo,
        dlsRepo,
      );

      // Recharger pour obtenir le nouveau statut
      const demandeLogicielMisAJour = await dlRepo.findOne({
        where: { id: demandeLogicielId },
        relations: ['logiciel'],
      });

      // 2. Vérifier et mettre à jour l'état de la demande globale
      const ancienEtatDemande = demande.etat;
      await this.installationSyncService.verifierEtatDemande(
        demandeId,
        dlRepo,
        demandeRepo,
      );

      // Recharger la demande pour obtenir le nouvel état
      const demandeMisAJour = await demandeRepo.findOne({
        where: { id: demandeId },
      });

      // 3. Enregistrer dans l'historique (non bloquant)
      if (this.historiqueService && demandeLogicielMisAJour) {
        const typeAction = updateDto.estInstallee
          ? TypeActionHistorique.INSTALLATION
          : TypeActionHistorique.DESINSTALLATION;

        const commentaire = updateDto.commentaire || 
          `${updateDto.estInstallee ? 'Installation' : 'Désinstallation'} dans salle ${salleId}. ` +
          `Statut logiciel: ${ancienStatutDL} → ${demandeLogicielMisAJour.statutInstallation}` +
          (ancienEtatDemande !== demandeMisAJour?.etat 
            ? `. État demande: ${ancienEtatDemande} → ${demandeMisAJour?.etat}` 
            : '');

        this.enregistrerHistorique({
          demandeId,
          demandeLogicielId,
          logicielId: demandeLogiciel.logicielId,
          utilisateurId: 'system', // Service informatique - TODO: utiliser l'ID réel
          typeAction,
          ancienEtat: ancienEtatDemande,
          nouvelEtat: demandeMisAJour?.etat || demande.etat,
          ancienStatutInstallation: ancienStatutDL,
          nouveauStatutInstallation: demandeLogicielMisAJour.statutInstallation,
          commentaire,
        }).catch((err) => console.error('Erreur enregistrement historique:', err));
      }

      return savedDLS;
    });
  }

  /**
   * Méthode helper pour enregistrer dans l'historique (non bloquant)
   */
  private async enregistrerHistorique(data: {
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

  /**
   * Marque un logiciel comme installé dans toutes les salles d'un DemandeLogiciel
   */
  async marquerInstalleToutesSalles(
    demandeId: string,
    demandeLogicielId: string,
    dateInstallation?: Date,
    commentaire?: string,
  ): Promise<void> {
    const demande = await this.demandeRepository.findOne({
      where: { id: demandeId },
    });
    if (!demande) {
      throw new AggregateNotFoundException('Demande', demandeId);
    }

    const demandeLogiciel = await this.demandeLogicielRepository.findOne({
      where: { id: demandeLogicielId, demandeId },
    });
    if (!demandeLogiciel) {
      throw new AggregateNotFoundException('DemandeLogiciel', demandeLogicielId);
    }

    await this.dataSource.transaction(async (manager) => {
      const dlsRepo = manager.getRepository(DemandeLogicielSalle);
      const dlRepo = manager.getRepository(DemandeLogiciel);
      const demandeRepo = manager.getRepository(Demande);

      // Récupérer le DemandeLogiciel pour avoir l'ancien statut
      const demandeLogiciel = await dlRepo.findOne({
        where: { id: demandeLogicielId },
      });
      const ancienStatutDL = demandeLogiciel?.statutInstallation;

      const allDLS = await dlsRepo.find({
        where: { demandeLogicielId },
      });

      const dateInst = dateInstallation || new Date();

      // Marquer toutes les salles comme installées
      for (const dls of allDLS) {
        dls.marquerInstallee(dateInst, commentaire);
        await dlsRepo.save(dls);
      }

      // 1. Recalculer le statut du DemandeLogiciel
      await this.installationSyncService.recalculerStatutInstallation(
        demandeLogicielId,
        dlRepo,
        dlsRepo,
      );

      // Recharger pour obtenir le nouveau statut
      const demandeLogicielMisAJour = await dlRepo.findOne({
        where: { id: demandeLogicielId },
        relations: ['logiciel'],
      });

      // 2. Vérifier et mettre à jour l'état de la demande globale
      const demande = await demandeRepo.findOne({
        where: { id: demandeId },
      });
      const ancienEtatDemande = demande?.etat;
      await this.installationSyncService.verifierEtatDemande(
        demandeId,
        dlRepo,
        demandeRepo,
      );

      // Recharger la demande pour obtenir le nouvel état
      const demandeMisAJour = await demandeRepo.findOne({
        where: { id: demandeId },
      });

      // 3. Enregistrer dans l'historique (non bloquant)
      if (this.historiqueService && demandeLogicielMisAJour) {
        const commentaireHistorique = 
          `Installation dans toutes les salles (${allDLS.length} salle(s)). ` +
          `Statut logiciel: ${ancienStatutDL} → ${demandeLogicielMisAJour.statutInstallation}` +
          (ancienEtatDemande !== demandeMisAJour?.etat 
            ? `. État demande: ${ancienEtatDemande} → ${demandeMisAJour?.etat}` 
            : '');

        this.enregistrerHistorique({
          demandeId,
          demandeLogicielId,
          logicielId: demandeLogicielMisAJour.logicielId,
          utilisateurId: 'system', // Service informatique - TODO: utiliser l'ID réel
          typeAction: TypeActionHistorique.INSTALLATION,
          ancienEtat: ancienEtatDemande || undefined,
          nouvelEtat: demandeMisAJour?.etat || undefined,
          ancienStatutInstallation: ancienStatutDL || undefined,
          nouveauStatutInstallation: demandeLogicielMisAJour.statutInstallation,
          commentaire: commentaireHistorique,
        }).catch((err) => console.error('Erreur enregistrement historique:', err));
      }
    });
  }

}

