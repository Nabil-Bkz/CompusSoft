import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Demande } from '../entities/demande.entity';
import { DemandeLogiciel } from '../entities/demande-logiciel.entity';
import { DemandeLogicielSalle } from '../entities/demande-logiciel-salle.entity';
import { Logiciel } from '../../software-catalog/entities/logiciel.entity';
import { Salle } from '../../infrastructure/entities/salle.entity';
import { Utilisateur } from '../../user-management/entities/utilisateur.entity';
import { CreateDemandeDto } from '../dto/create-demande.dto';
import { UpdateDemandeDto } from '../dto/update-demande.dto';
import { FermerDemandeDto } from '../dto/fermer-demande.dto';
import { AggregateNotFoundException } from '../../../common/exceptions/aggregate-not-found.exception';
import { BusinessRuleViolationException } from '../../../common/exceptions/business-rule-violation.exception';
import { InvalidStateTransitionException } from '../../../common/exceptions/invalid-state-transition.exception';
import { RequestStatus } from '../../../common/value-objects/request-status.vo';
import { SoftwareInstallationStatus } from '../../../common/value-objects/software-installation-status.vo';
import { calculateInstallationStatus } from '../../../common/value-objects/software-installation-status.vo';
import { AcademicYear } from '../../../common/value-objects/academic-year.vo';
import { ResumeInstallation } from '../../../common/value-objects/resume-installation.vo';
import { DetailInstallation } from '../../../common/value-objects/detail-installation.vo';
import { canTransitionTo } from '../../../common/value-objects/request-status.vo';
import { TypeActionHistorique } from '../../history/entities/historique.entity';

/**
 * Service pour la gestion des demandes
 */
@Injectable()
export class DemandeService {
  constructor(
    @InjectRepository(Demande)
    private readonly demandeRepository: Repository<Demande>,
    @InjectRepository(DemandeLogiciel)
    private readonly demandeLogicielRepository: Repository<DemandeLogiciel>,
    @InjectRepository(DemandeLogicielSalle)
    private readonly demandeLogicielSalleRepository: Repository<DemandeLogicielSalle>,
    @InjectRepository(Logiciel)
    private readonly logicielRepository: Repository<Logiciel>,
    @InjectRepository(Salle)
    private readonly salleRepository: Repository<Salle>,
    @InjectRepository(Utilisateur)
    private readonly utilisateurRepository: Repository<Utilisateur>,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => 'HistoriqueService'))
    @Optional()
    private readonly historiqueService?: any, // Optional pour éviter les erreurs de circularité
  ) {}

  /**
   * Crée une nouvelle demande
   */
  async create(enseignantId: string, createDto: CreateDemandeDto): Promise<Demande> {
    // Vérifier que l'enseignant existe
    const enseignant = await this.utilisateurRepository.findOne({
      where: { id: enseignantId },
    });
    if (!enseignant) {
      throw new AggregateNotFoundException('Utilisateur', enseignantId);
    }

    // Valider année universitaire
    let anneeUniv: AcademicYear;
    try {
      anneeUniv = AcademicYear.fromYear(createDto.anneeUniversitaire);
    } catch (error) {
      throw new BusinessRuleViolationException(
        `Année universitaire invalide: ${createDto.anneeUniversitaire}`,
      );
    }

    // Valider que tous les logiciels existent
    const logicielIds = createDto.logiciels.map((l) => l.logicielId);
    const logiciels = await this.logicielRepository.find({
      where: { id: In(logicielIds), actif: true },
    });
    if (logiciels.length !== logicielIds.length) {
      throw new BusinessRuleViolationException(
        'Un ou plusieurs logiciels sont introuvables ou inactifs',
      );
    }

    // Valider que toutes les salles existent
    const sallesIdsSet = new Set<string>();
    createDto.logiciels.forEach((l) => {
      l.sallesIds.forEach((sId) => sallesIdsSet.add(sId));
    });
    const salles = await this.salleRepository.find({
      where: { id: In(Array.from(sallesIdsSet)) },
    });
    if (salles.length !== sallesIdsSet.size) {
      throw new BusinessRuleViolationException(
        'Une ou plusieurs salles sont introuvables',
      );
    }

    // Utiliser une transaction pour créer la demande complète
    return await this.dataSource.transaction(async (manager) => {
      const demandeRepo = manager.getRepository(Demande);
      const demandeLogicielRepo = manager.getRepository(DemandeLogiciel);
      const demandeLogicielSalleRepo = manager.getRepository(DemandeLogicielSalle);

      // Créer la demande
      const demande = demandeRepo.create({
        enseignantId,
        dateSouhaitee: new Date(createDto.dateSouhaitee),
        anneeUniversitaire: createDto.anneeUniversitaire,
        etat: RequestStatus.NOUVELLE,
        commentaire: createDto.commentaire || null,
      });
      const savedDemande = await demandeRepo.save(demande);

      // Créer les DemandeLogiciel et DemandeLogicielSalle
      for (const logicielDto of createDto.logiciels) {
        const logiciel = logiciels.find((l) => l.id === logicielDto.logicielId);
        if (!logiciel) continue;

        const demandeLogiciel = demandeLogicielRepo.create({
          demandeId: savedDemande.id,
          logicielId: logicielDto.logicielId,
          statutInstallation: SoftwareInstallationStatus.EN_ATTENTE,
        });
        const savedDemandeLogiciel = await demandeLogicielRepo.save(demandeLogiciel);

        // Créer les DemandeLogicielSalle
        for (const salleId of logicielDto.sallesIds) {
          const demandeLogicielSalle = demandeLogicielSalleRepo.create({
            demandeLogicielId: savedDemandeLogiciel.id,
            salleId,
            estInstallee: false,
          });
          await demandeLogicielSalleRepo.save(demandeLogicielSalle);
        }
      }

      // Retourner la demande avec relations chargées
      const demandeComplete = await demandeRepo.findOne({
        where: { id: savedDemande.id },
        relations: ['demandeLogiciels', 'demandeLogiciels.logiciel'],
      });

      // Enregistrer dans l'historique (asynchrone, non bloquant)
      if (this.historiqueService && demandeComplete && demandeComplete.demandeLogiciels) {
        for (const dl of demandeComplete.demandeLogiciels) {
          this.enregistrerHistorique({
            demandeId: demandeComplete.id,
            demandeLogicielId: dl.id,
            logicielId: dl.logicielId,
            utilisateurId: enseignantId,
            typeAction: TypeActionHistorique.CREATION_DEMANDE,
            commentaire: `Création demande avec logiciel ${dl.logiciel?.nom || 'N/A'}`,
          }).catch((err) => console.error('Erreur enregistrement historique:', err));
        }
      }

      return demandeComplete;
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
    typeAction: any;
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
   * Retourne toutes les demandes d'un enseignant
   */
  async findAllByEnseignant(enseignantId: string): Promise<Demande[]> {
    return await this.demandeRepository.find({
      where: { enseignantId },
      relations: [
        'demandeLogiciels',
        'demandeLogiciels.logiciel',
        'demandeLogiciels.demandeLogicielSalles',
        'demandeLogiciels.demandeLogicielSalles.salle',
      ],
      order: { dateCreation: 'DESC' },
    });
  }

  /**
   * Retourne toutes les demandes en cours (pour service informatique)
   */
  async findAllEnCours(): Promise<Demande[]> {
    return await this.demandeRepository.find({
      where: [
        { etat: RequestStatus.NOUVELLE },
        { etat: RequestStatus.EN_COURS },
      ],
      relations: [
        'enseignant',
        'demandeLogiciels',
        'demandeLogiciels.logiciel',
        'demandeLogiciels.demandeLogicielSalles',
        'demandeLogiciels.demandeLogicielSalles.salle',
      ],
      order: { dateCreation: 'DESC' },
    });
  }

  /**
   * Retourne une demande par son ID
   */
  async findOne(id: string): Promise<Demande> {
    const demande = await this.demandeRepository.findOne({
      where: { id },
      relations: [
        'enseignant',
        'demandeLogiciels',
        'demandeLogiciels.logiciel',
        'demandeLogiciels.demandeLogicielSalles',
        'demandeLogiciels.demandeLogicielSalles.salle',
      ],
    });

    if (!demande) {
      throw new AggregateNotFoundException('Demande', id);
    }

    return demande;
  }

  /**
   * Vérifie si l'utilisateur est propriétaire de la demande
   */
  async verifyOwnership(demandeId: string, utilisateurId: string): Promise<void> {
    const demande = await this.findOne(demandeId);
    if (demande.enseignantId !== utilisateurId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à accéder à cette demande');
    }
  }

  /**
   * Met à jour une demande (si elle peut être modifiée)
   */
  async update(
    demandeId: string,
    enseignantId: string,
    updateDto: UpdateDemandeDto,
  ): Promise<Demande> {
    const demande = await this.findOne(demandeId);

    // Vérifier la propriété
    if (demande.enseignantId !== enseignantId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier cette demande');
    }

    // Vérifier que la demande peut être modifiée
    if (!demande.peutEtreModifiee()) {
      throw new BusinessRuleViolationException(
        `Impossible de modifier une demande avec l'état "${demande.etat}"`,
      );
    }

    // Vérifier que les logiciels ne sont pas tous installés
    await this.chargerDemandeLogiciels(demande);
    const tousInstalles = demande.demandeLogiciels.every(
      (dl) => dl.statutInstallation === SoftwareInstallationStatus.TOUS_INSTALLES,
    );
    if (tousInstalles && demande.demandeLogiciels.length > 0) {
      throw new BusinessRuleViolationException(
        'Impossible de modifier une demande dont tous les logiciels sont installés',
      );
    }

    // Mise à jour des champs simples
    if (updateDto.dateSouhaitee) {
      demande.dateSouhaitee = new Date(updateDto.dateSouhaitee);
    }
    if (updateDto.commentaire !== undefined) {
      demande.commentaire = updateDto.commentaire;
    }
    if (updateDto.anneeUniversitaire) {
      try {
        AcademicYear.fromYear(updateDto.anneeUniversitaire);
        demande.anneeUniversitaire = updateDto.anneeUniversitaire;
      } catch (error) {
        throw new BusinessRuleViolationException(
          `Année universitaire invalide: ${updateDto.anneeUniversitaire}`,
        );
      }
    }

    demande.dateDerniereModification = new Date();

    // TODO: Gérer l'ajout/suppression de logiciels si nécessaire
    // Pour l'instant, on ne met à jour que les champs de base

    const savedDemande = await this.demandeRepository.save(demande);

    // Charger les relations si nécessaire
    await this.chargerDemandeLogiciels(savedDemande);

    // Enregistrer dans l'historique (non bloquant)
    if (savedDemande.demandeLogiciels && savedDemande.demandeLogiciels.length > 0) {
      for (const dl of savedDemande.demandeLogiciels) {
        this.enregistrerHistorique({
          demandeId: savedDemande.id,
          demandeLogicielId: dl.id,
          logicielId: dl.logicielId,
          utilisateurId: enseignantId,
          typeAction: TypeActionHistorique.MODIFICATION_DEMANDE,
          ancienEtat: demande.etat,
          nouvelEtat: savedDemande.etat,
          commentaire: updateDto.commentaire || 'Modification de la demande',
        }).catch((err) => console.error('Erreur enregistrement historique:', err));
      }
    }

    return savedDemande;
  }

  /**
   * Ferme une demande
   */
  async fermer(
    demandeId: string,
    enseignantId: string,
    fermerDto: FermerDemandeDto,
  ): Promise<Demande> {
    const demande = await this.findOne(demandeId);

    // Vérifier la propriété
    if (demande.enseignantId !== enseignantId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à fermer cette demande');
    }

    // Vérifier que la demande peut être fermée
    if (!demande.peutEtreFermee()) {
      throw new BusinessRuleViolationException(
        `Impossible de fermer une demande avec l'état "${demande.etat}"`,
      );
    }

    // Fermer la demande
    const ancienEtat = demande.etat;
    demande.etat = RequestStatus.FERMEE;
    demande.commentaireFermeture = fermerDto.commentaireFermeture;
    demande.dateFermeture = new Date();
    demande.dateDerniereModification = new Date();

    const savedDemande = await this.demandeRepository.save(demande);

    // Charger les relations si nécessaire
    await this.chargerDemandeLogiciels(savedDemande);

    // Enregistrer dans l'historique (non bloquant)
    if (savedDemande.demandeLogiciels && savedDemande.demandeLogiciels.length > 0) {
      for (const dl of savedDemande.demandeLogiciels) {
        this.enregistrerHistorique({
          demandeId: savedDemande.id,
          demandeLogicielId: dl.id,
          logicielId: dl.logicielId,
          utilisateurId: enseignantId,
          typeAction: TypeActionHistorique.FERMETURE,
          ancienEtat,
          nouvelEtat: RequestStatus.FERMEE,
          commentaire: fermerDto.commentaireFermeture,
        }).catch((err) => console.error('Erreur enregistrement historique:', err));
      }
    }

    return savedDemande;
  }

  /**
   * Marque une demande comme "en cours" (service informatique)
   */
  async marquerEnCours(demandeId: string): Promise<Demande> {
    const demande = await this.findOne(demandeId);

    // Vérifier la transition d'état
    if (!canTransitionTo(demande.etat, RequestStatus.EN_COURS)) {
      throw new InvalidStateTransitionException(
        demande.etat,
        RequestStatus.EN_COURS,
      );
    }

    const ancienEtat = demande.etat;
    demande.etat = RequestStatus.EN_COURS;
    demande.dateDerniereModification = new Date();

    const savedDemande = await this.demandeRepository.save(demande);

    // Charger les relations si nécessaire
    await this.chargerDemandeLogiciels(savedDemande);

    // Enregistrer dans l'historique (non bloquant)
    if (savedDemande.demandeLogiciels && savedDemande.demandeLogiciels.length > 0) {
      for (const dl of savedDemande.demandeLogiciels) {
        this.enregistrerHistorique({
          demandeId: savedDemande.id,
          demandeLogicielId: dl.id,
          logicielId: dl.logicielId,
          utilisateurId: 'system', // Service informatique - TODO: utiliser l'ID réel
          typeAction: TypeActionHistorique.CHANGEMENT_STATUT,
          ancienEtat,
          nouvelEtat: RequestStatus.EN_COURS,
          commentaire: 'Demande marquée comme en cours',
        }).catch((err) => console.error('Erreur enregistrement historique:', err));
      }
    }

    return savedDemande;
  }

  /**
   * Obtient le résumé d'installation par logiciel
   */
  async obtenirResumeInstallationParLogiciel(
    demandeId: string,
  ): Promise<ResumeInstallation[]> {
    const demande = await this.findOne(demandeId);
    await this.chargerDemandeLogiciels(demande);

    const resumes: ResumeInstallation[] = [];

    for (const demandeLogiciel of demande.demandeLogiciels) {
      await this.chargerDemandeLogicielSalles(demandeLogiciel);

      // Vérifier que demandeLogicielSalles est chargé
      if (!demandeLogiciel.demandeLogicielSalles || demandeLogiciel.demandeLogicielSalles.length === 0) {
        // Si pas de salles, créer un résumé vide
        const resume = new ResumeInstallation(
          demandeLogiciel.logicielId,
          demandeLogiciel.logiciel?.nom || 'Logiciel inconnu',
          0,
          0,
          0,
          SoftwareInstallationStatus.EN_ATTENTE,
          [],
          [],
        );
        resumes.push(resume);
        continue;
      }

      const totalSalles = demandeLogiciel.demandeLogicielSalles.length;
      const sallesInstallees = demandeLogiciel.demandeLogicielSalles.filter(
        (dls) => dls.estInstallee && dls.salle, // Vérifier que la salle est chargée
      );
      const nombreInstallees = sallesInstallees.length;
      const nombreNonInstallees = totalSalles - nombreInstallees;

      // Vérifier que les salles sont chargées
      const sallesInstalleesList = sallesInstallees
        .filter((dls) => dls.salle) // Filtrer les salles null
        .map((dls) => ({
          id: dls.salle.id,
          nom: dls.salle.nom,
        }));

      const sallesNonInstalleesList = demandeLogiciel.demandeLogicielSalles
        .filter((dls) => !dls.estInstallee && dls.salle) // Filtrer les salles null
        .map((dls) => ({
          id: dls.salle.id,
          nom: dls.salle.nom,
        }));

      const statut = calculateInstallationStatus(
        totalSalles,
        nombreInstallees,
        demandeLogiciel.statutInstallation === SoftwareInstallationStatus.PROBLEME,
        demandeLogiciel.statutInstallation === SoftwareInstallationStatus.CHANGEMENT,
      );

      // Vérifier que le logiciel est chargé
      if (!demandeLogiciel.logiciel) {
        // Charger le logiciel si pas déjà chargé
        const logiciel = await this.logicielRepository.findOne({
          where: { id: demandeLogiciel.logicielId },
        });
        if (!logiciel) {
          console.warn(`Logiciel ${demandeLogiciel.logicielId} introuvable`);
          continue;
        }
        demandeLogiciel.logiciel = logiciel;
      }

      const resume = new ResumeInstallation(
        demandeLogiciel.logicielId,
        demandeLogiciel.logiciel.nom,
        totalSalles,
        nombreInstallees,
        nombreNonInstallees,
        statut,
        sallesInstalleesList,
        sallesNonInstalleesList,
      );

      resumes.push(resume);
    }

    return resumes;
  }

  /**
   * Obtient les détails complets d'installation
   */
  async obtenirDetailsInstallationComplets(
    demandeId: string,
    logicielId?: string,
  ): Promise<Map<string, DetailInstallation[]>> {
    const demande = await this.findOne(demandeId);
    await this.chargerDemandeLogiciels(demande);

    const details = new Map<string, DetailInstallation[]>();

    for (const demandeLogiciel of demande.demandeLogiciels) {
      if (logicielId && demandeLogiciel.logicielId !== logicielId) {
        continue;
      }

      await this.chargerDemandeLogicielSalles(demandeLogiciel);

      const detailsLogiciel = demandeLogiciel.demandeLogicielSalles.map((dls) =>
        DetailInstallation.fromObject({
          salleId: dls.salle.id,
          salleNom: dls.salle.nom,
          estInstallee: dls.estInstallee,
          dateInstallation: dls.dateInstallation,
          dateAssignation: dls.dateAssignation,
          commentaire: dls.commentaireInstallation,
        }),
      );

      details.set(demandeLogiciel.logicielId, detailsLogiciel);
    }

    return details;
  }

  /**
   * Charge les DemandeLogiciel pour une demande
   */
  private async chargerDemandeLogiciels(demande: Demande): Promise<void> {
    if (!demande.demandeLogiciels || demande.demandeLogiciels.length === 0) {
      demande.demandeLogiciels = await this.demandeLogicielRepository.find({
        where: { demandeId: demande.id },
        relations: ['logiciel'],
      });
    } else {
      // S'assurer que les logiciels sont chargés pour chaque DemandeLogiciel
      for (const dl of demande.demandeLogiciels) {
        if (!dl.logiciel) {
          const logiciel = await this.logicielRepository.findOne({
            where: { id: dl.logicielId },
          });
          if (logiciel) {
            dl.logiciel = logiciel;
          }
        }
      }
    }
  }

  /**
   * Charge les DemandeLogicielSalle pour un DemandeLogiciel
   */
  private async chargerDemandeLogicielSalles(
    demandeLogiciel: DemandeLogiciel,
  ): Promise<void> {
    if (!demandeLogiciel.demandeLogicielSalles) {
      demandeLogiciel.demandeLogicielSalles =
        await this.demandeLogicielSalleRepository.find({
          where: { demandeLogicielId: demandeLogiciel.id },
          relations: ['salle'],
        });
    }
  }
}

