import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Demande } from '../entities/demande.entity';
import { DemandeLogiciel } from '../entities/demande-logiciel.entity';
import { DemandeLogicielSalle } from '../entities/demande-logiciel-salle.entity';
import { RequestStatus } from '../../../common/value-objects/request-status.vo';
import { SoftwareInstallationStatus } from '../../../common/value-objects/software-installation-status.vo';
import { calculateInstallationStatus } from '../../../common/value-objects/software-installation-status.vo';

/**
 * Service dédié pour la synchronisation des statuts
 * Garantit la cohérence entre DemandeLogicielSalle → DemandeLogiciel → Demande
 */
@Injectable()
export class InstallationSyncService {
  constructor(
    @InjectRepository(DemandeLogicielSalle)
    private readonly demandeLogicielSalleRepository: Repository<DemandeLogicielSalle>,
    @InjectRepository(DemandeLogiciel)
    private readonly demandeLogicielRepository: Repository<DemandeLogiciel>,
    @InjectRepository(Demande)
    private readonly demandeRepository: Repository<Demande>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Synchronise complètement les statuts pour une demande
   * Méthode utilitaire pour forcer une synchronisation complète
   */
  async synchroniserDemandeComplete(demandeId: string): Promise<void> {
    const demande = await this.demandeRepository.findOne({
      where: { id: demandeId },
    });
    if (!demande) {
      throw new Error(`Demande ${demandeId} introuvable`);
    }

    await this.dataSource.transaction(async (manager) => {
      const dlRepo = manager.getRepository(DemandeLogiciel);
      const dlsRepo = manager.getRepository(DemandeLogicielSalle);
      const demandeRepo = manager.getRepository(Demande);

      // Récupérer tous les DemandeLogiciel de la demande
      const allDL = await dlRepo.find({
        where: { demandeId },
      });

      // Pour chaque DemandeLogiciel, recalculer son statut
      for (const dl of allDL) {
        await this.recalculerStatutInstallation(
          dl.id,
          dlRepo,
          dlsRepo,
        );
      }

      // Mettre à jour l'état de la demande
      await this.verifierEtatDemande(demandeId, dlRepo, demandeRepo);
    });
  }

  /**
   * Recalcule le statut d'installation d'un DemandeLogiciel
   * Basé sur les statuts des DemandeLogicielSalle
   */
  async recalculerStatutInstallation(
    demandeLogicielId: string,
    dlRepo?: Repository<DemandeLogiciel>,
    dlsRepo?: Repository<DemandeLogicielSalle>,
  ): Promise<SoftwareInstallationStatus> {
    const transactionManager = dlRepo && dlsRepo;
    
    const dlRepository = dlRepo || this.demandeLogicielRepository;
    const dlsRepository = dlsRepo || this.demandeLogicielSalleRepository;

    const demandeLogiciel = await dlRepository.findOne({
      where: { id: demandeLogicielId },
    });
    if (!demandeLogiciel) {
      throw new Error(`DemandeLogiciel ${demandeLogicielId} introuvable`);
    }

    const allDLS = await dlsRepository.find({
      where: { demandeLogicielId },
    });

    const totalSalles = allDLS.length;
    const sallesInstallees = allDLS.filter((dls) => dls.estInstallee).length;

    // Conserver les statuts PROBLEME et CHANGEMENT seulement s'ils sont explicitement définis
    const ancienStatut = demandeLogiciel.statutInstallation;
    const hasProblemeExplicite =
      ancienStatut === SoftwareInstallationStatus.PROBLEME &&
      demandeLogiciel.commentaire !== null;
    const hasChangementExplicite =
      ancienStatut === SoftwareInstallationStatus.CHANGEMENT &&
      demandeLogiciel.dateChangement !== null;

    // Calculer le nouveau statut
    const nouveauStatut = calculateInstallationStatus(
      totalSalles,
      sallesInstallees,
      hasProblemeExplicite,
      hasChangementExplicite,
    );

    // Ne mettre à jour que si le statut a changé
    if (ancienStatut !== nouveauStatut) {
      demandeLogiciel.statutInstallation = nouveauStatut;

      // Si tous installés, mettre la date d'installation (si pas déjà définie)
      if (
        nouveauStatut === SoftwareInstallationStatus.TOUS_INSTALLES &&
        !demandeLogiciel.dateInstallation
      ) {
        demandeLogiciel.dateInstallation = new Date();
      }

      // Si on passe de TOUS_INSTALLES à autre chose, réinitialiser la date
      if (
        ancienStatut === SoftwareInstallationStatus.TOUS_INSTALLES &&
        nouveauStatut !== SoftwareInstallationStatus.TOUS_INSTALLES
      ) {
        demandeLogiciel.dateInstallation = null;
      }

      await dlRepository.save(demandeLogiciel);
    }

    return nouveauStatut;
  }

  /**
   * Vérifie et met à jour l'état de la demande globale
   * Basé sur les statuts de tous les DemandeLogiciel
   */
  async verifierEtatDemande(
    demandeId: string,
    dlRepo?: Repository<DemandeLogiciel>,
    demandeRepo?: Repository<Demande>,
  ): Promise<RequestStatus | null> {
    const dlRepository = dlRepo || this.demandeLogicielRepository;
    const demandeRepository = demandeRepo || this.demandeRepository;

    const demande = await demandeRepository.findOne({
      where: { id: demandeId },
    });
    if (!demande) {
      throw new Error(`Demande ${demandeId} introuvable`);
    }

    // Ne pas changer l'état si la demande est fermée ou expirée
    if (
      demande.etat === RequestStatus.FERMEE ||
      demande.etat === RequestStatus.EXPIREE
    ) {
      return demande.etat;
    }

    const allDL = await dlRepository.find({
      where: { demandeId },
    });

    if (allDL.length === 0) {
      return demande.etat; // Pas de logiciels dans la demande
    }

    const ancienEtat = demande.etat;

    // Déterminer le nouvel état basé sur les statuts des logiciels
    const tousInstalles = allDL.every(
      (dl) => dl.statutInstallation === SoftwareInstallationStatus.TOUS_INSTALLES,
    );

    const auMoinsUnEnCours = allDL.some(
      (dl) =>
        dl.statutInstallation === SoftwareInstallationStatus.PARTIELLEMENT_INSTALLE ||
        dl.statutInstallation === SoftwareInstallationStatus.PROBLEME ||
        dl.statutInstallation === SoftwareInstallationStatus.CHANGEMENT,
    );

    const tousEnAttente = allDL.every(
      (dl) => dl.statutInstallation === SoftwareInstallationStatus.EN_ATTENTE,
    );

    // Calculer le nouvel état
    let nouvelEtat: RequestStatus;

    if (tousInstalles) {
      // Tous les logiciels sont installés → demande installée
      nouvelEtat = RequestStatus.INSTALLEE;
    } else if (tousEnAttente) {
      // Tous en attente → nouvelle ou en_cours (selon l'état actuel)
      if (demande.etat === RequestStatus.NOUVELLE) {
        nouvelEtat = RequestStatus.NOUVELLE; // Garder nouvelle si pas encore commencé
      } else {
        nouvelEtat = RequestStatus.EN_COURS; // Sinon en_cours
      }
    } else {
      // Au moins un logiciel en cours d'installation → en_cours
      nouvelEtat = RequestStatus.EN_COURS;
    }

    // Mettre à jour seulement si l'état a changé
    if (ancienEtat !== nouvelEtat) {
      demande.etat = nouvelEtat;
      demande.dateDerniereModification = new Date();
      await demandeRepository.save(demande);
    }

    return nouvelEtat;
  }

  /**
   * Vérifie la cohérence des statuts pour une demande
   * Utile pour debug et validation
   */
  async verifierCohérence(demandeId: string): Promise<{
    cohérent: boolean;
    détails: {
      demande: {
        id: string;
        etat: RequestStatus;
        nombreLogiciels: number;
      };
      logiciels: Array<{
        id: string;
        statut: SoftwareInstallationStatus;
        nombreSalles: number;
        sallesInstallees: number;
        sallesNonInstallees: number;
      }>;
      problèmes?: string[];
    };
  }> {
    const demande = await this.demandeRepository.findOne({
      where: { id: demandeId },
    });
    if (!demande) {
      throw new Error(`Demande ${demandeId} introuvable`);
    }

    const allDL = await this.demandeLogicielRepository.find({
      where: { demandeId },
    });

    const détailsLogiciels = [];
    const problèmes: string[] = [];

    for (const dl of allDL) {
      const allDLS = await this.demandeLogicielSalleRepository.find({
        where: { demandeLogicielId: dl.id },
      });

      const sallesInstallees = allDLS.filter((dls) => dls.estInstallee).length;
      const sallesNonInstallees = allDLS.length - sallesInstallees;

      // Calculer le statut attendu
      const statutAttendu = calculateInstallationStatus(
        allDLS.length,
        sallesInstallees,
        dl.statutInstallation === SoftwareInstallationStatus.PROBLEME && dl.commentaire !== null,
        dl.statutInstallation === SoftwareInstallationStatus.CHANGEMENT && dl.dateChangement !== null,
      );

      // Vérifier si le statut est cohérent
      if (dl.statutInstallation !== statutAttendu) {
        problèmes.push(
          `DemandeLogiciel ${dl.id}: statut actuel "${dl.statutInstallation}" mais devrait être "${statutAttendu}"`,
        );
      }

      détailsLogiciels.push({
        id: dl.id,
        statut: dl.statutInstallation,
        nombreSalles: allDLS.length,
        sallesInstallees,
        sallesNonInstallees,
      });
    }

    // Vérifier l'état de la demande
    const tousInstalles = allDL.every(
      (dl) => dl.statutInstallation === SoftwareInstallationStatus.TOUS_INSTALLES,
    );
    const tousEnAttente = allDL.every(
      (dl) => dl.statutInstallation === SoftwareInstallationStatus.EN_ATTENTE,
    );

    let étatAttendu: RequestStatus;
    if (tousInstalles && allDL.length > 0) {
      étatAttendu = RequestStatus.INSTALLEE;
    } else if (tousEnAttente && demande.etat === RequestStatus.NOUVELLE) {
      étatAttendu = RequestStatus.NOUVELLE;
    } else if (allDL.length > 0) {
      étatAttendu = RequestStatus.EN_COURS;
    } else {
      étatAttendu = demande.etat; // Pas de changement si pas de logiciels
    }

    if (demande.etat !== étatAttendu && demande.etat !== RequestStatus.FERMEE && demande.etat !== RequestStatus.EXPIREE) {
      problèmes.push(
        `Demande: état actuel "${demande.etat}" mais devrait être "${étatAttendu}"`,
      );
    }

    return {
      cohérent: problèmes.length === 0,
      détails: {
        demande: {
          id: demande.id,
          etat: demande.etat,
          nombreLogiciels: allDL.length,
        },
        logiciels: détailsLogiciels,
        problèmes: problèmes.length > 0 ? problèmes : undefined,
      },
    };
  }
}








