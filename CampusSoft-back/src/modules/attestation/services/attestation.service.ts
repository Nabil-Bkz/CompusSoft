import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import { Attestation } from '../entities/attestation.entity';
import { Demande } from '../../request-management/entities/demande.entity';
import { CreateAttestationDto } from '../dto/create-attestation.dto';
import { ConfirmerAttestationDto } from '../dto/confirmer-attestation.dto';
import { AggregateNotFoundException } from '../../../common/exceptions/aggregate-not-found.exception';
import { BusinessRuleViolationException } from '../../../common/exceptions/business-rule-violation.exception';
import { AttestationStatus } from '../../../common/value-objects/attestation-status.vo';
import { AcademicYear } from '../../../common/value-objects/academic-year.vo';
import { RequestStatus } from '../../../common/value-objects/request-status.vo';

/**
 * Service pour la gestion des attestations
 */
@Injectable()
export class AttestationService {
  constructor(
    @InjectRepository(Attestation)
    private readonly attestationRepository: Repository<Attestation>,
    @InjectRepository(Demande)
    private readonly demandeRepository: Repository<Demande>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crée une attestation pour une demande
   */
  async create(createDto: CreateAttestationDto): Promise<Attestation> {
    // Vérifier que la demande existe
    const demande = await this.demandeRepository.findOne({
      where: { id: createDto.demandeId },
    });
    if (!demande) {
      throw new AggregateNotFoundException('Demande', createDto.demandeId);
    }

    // Vérifier qu'il n'y a pas déjà une attestation pour cette demande
    const existing = await this.attestationRepository.findOne({
      where: { demandeId: createDto.demandeId },
    });
    if (existing) {
      throw new ConflictException(
        `Une attestation existe déjà pour la demande ${createDto.demandeId}`,
      );
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

    // Valider dates
    const dateDebut = new Date(createDto.dateDebut);
    const dateFin = new Date(createDto.dateFin);
    if (dateDebut >= dateFin) {
      throw new BusinessRuleViolationException(
        'La date de début doit être antérieure à la date de fin',
      );
    }

    // Vérifier que les dates sont dans l'année universitaire
    if (!anneeUniv.contains(dateDebut) || !anneeUniv.contains(dateFin)) {
      throw new BusinessRuleViolationException(
        'Les dates doivent être dans l\'année universitaire spécifiée',
      );
    }

    const attestation = this.attestationRepository.create({
      demandeId: createDto.demandeId,
      anneeUniversitaire: createDto.anneeUniversitaire,
      dateDebut,
      dateFin,
      statut: createDto.statut || AttestationStatus.PENDING,
      commentaire: createDto.commentaire || null,
    });

    return await this.attestationRepository.save(attestation);
  }

  /**
   * Retourne toutes les attestations
   */
  async findAll(statut?: AttestationStatus): Promise<Attestation[]> {
    const where: any = {};
    if (statut) {
      where.statut = statut;
    }

    return await this.attestationRepository.find({
      where,
      relations: ['demande', 'demande.enseignant'],
      order: { dateCreation: 'DESC' },
    });
  }

  /**
   * Retourne une attestation par son ID
   */
  async findOne(id: string): Promise<Attestation> {
    const attestation = await this.attestationRepository.findOne({
      where: { id },
      relations: ['demande', 'demande.enseignant'],
    });

    if (!attestation) {
      throw new AggregateNotFoundException('Attestation', id);
    }

    return attestation;
  }

  /**
   * Retourne l'attestation d'une demande
   */
  async findByDemandeId(demandeId: string): Promise<Attestation | null> {
    return await this.attestationRepository.findOne({
      where: { demandeId },
      relations: ['demande', 'demande.enseignant'],
    });
  }

  /**
   * Confirme une attestation
   */
  async confirmer(
    id: string,
    confirmerDto: ConfirmerAttestationDto,
  ): Promise<Attestation> {
    const attestation = await this.findOne(id);

    if (attestation.statut !== AttestationStatus.PENDING) {
      throw new BusinessRuleViolationException(
        `Seule une attestation en attente peut être confirmée. Statut actuel: ${attestation.statut}`,
      );
    }

    attestation.confirmer();
    if (confirmerDto.commentaire) {
      attestation.commentaire = confirmerDto.commentaire;
    }

    // Mettre à jour la demande pour prolonger la date d'expiration
    const demande = attestation.demande;
    if (demande) {
      // La demande reste valide jusqu'à la fin de l'année universitaire
      demande.dateExpiration = attestation.dateFin;
      await this.demandeRepository.save(demande);
    }

    return await this.attestationRepository.save(attestation);
  }

  /**
   * Expire une attestation
   */
  async expirer(id: string): Promise<Attestation> {
    const attestation = await this.findOne(id);
    attestation.expirer();
    return await this.attestationRepository.save(attestation);
  }

  /**
   * Expire automatiquement les attestations dues
   */
  async expirerAttestationsDuues(): Promise<number> {
    const aujourdhui = new Date();
    const attestationsDuues = await this.attestationRepository.find({
      where: {
        statut: AttestationStatus.PENDING,
        dateFin: LessThan(aujourdhui),
      },
    });

    for (const attestation of attestationsDuues) {
      attestation.expirer();
      await this.attestationRepository.save(attestation);
    }

    return attestationsDuues.length;
  }

  /**
   * Retourne les attestations qui nécessitent un rappel
   */
  async findAttestationsPourRappel(
    joursAvantExpiration: number = 30,
  ): Promise<Attestation[]> {
    try {
      const attestations = await this.attestationRepository.find({
        where: { statut: AttestationStatus.PENDING },
        relations: ['demande'],
      });

      // Ensure dates are properly converted to Date objects
      const attestationsWithDates = attestations.map((a) => {
        // Convert dateFin if it's a string
        if (a.dateFin && typeof a.dateFin === 'string') {
          a.dateFin = new Date(a.dateFin);
        }
        // Convert dateRappel if it's a string
        if (a.dateRappel && typeof a.dateRappel === 'string') {
          a.dateRappel = new Date(a.dateRappel);
        }
        return a;
      });

      // Filter with error handling for each attestation
      return attestationsWithDates.filter((a) => {
        try {
          // Ensure dateFin is a valid Date object
          if (!a.dateFin || !(a.dateFin instanceof Date) || isNaN(a.dateFin.getTime())) {
            return false;
          }
          return a.doitEnvoyerRappel(joursAvantExpiration);
        } catch (error) {
          // Log error but don't break the entire request
          console.error(`Error checking attestation ${a.id} for reminder:`, error);
          return false;
        }
      });
    } catch (error) {
      console.error('Error in findAttestationsPourRappel:', error);
      throw error;
    }
  }

  /**
   * Marque qu'un rappel a été envoyé
   */
  async marquerRappelEnvoye(id: string): Promise<Attestation> {
    const attestation = await this.findOne(id);
    attestation.dateRappel = new Date();
    return await this.attestationRepository.save(attestation);
  }

  /**
   * Crée automatiquement des attestations pour les demandes installées d'une année universitaire
   */
  async creerAttestationsPourAnnee(anneeUniversitaire: string): Promise<number> {
    let anneeUniv: AcademicYear;
    try {
      anneeUniv = AcademicYear.fromYear(anneeUniversitaire);
    } catch (error) {
      throw new BusinessRuleViolationException(
        `Année universitaire invalide: ${anneeUniversitaire}`,
      );
    }

    // Trouver toutes les demandes installées sans attestation pour cette année
    const demandesInstallees = await this.demandeRepository.find({
      where: {
        etat: RequestStatus.INSTALLEE,
        anneeUniversitaire,
      },
      relations: ['demandeLogiciels'],
    });

    let count = 0;

    await this.dataSource.transaction(async (manager) => {
      const attestationRepo = manager.getRepository(Attestation);

      for (const demande of demandesInstallees) {
        // Vérifier qu'il n'y a pas déjà une attestation
        const existing = await attestationRepo.findOne({
          where: { demandeId: demande.id },
        });

        if (!existing) {
          const attestation = attestationRepo.create({
            demandeId: demande.id,
            anneeUniversitaire,
            dateDebut: anneeUniv.startDate,
            dateFin: anneeUniv.endDate,
            statut: AttestationStatus.PENDING,
          });
          await attestationRepo.save(attestation);
          count++;
        }
      }
    });

    return count;
  }
}

