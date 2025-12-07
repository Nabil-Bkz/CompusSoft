import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Demande } from '../../request-management/entities/demande.entity';
import { AttestationStatus } from '../../../common/value-objects/attestation-status.vo';
import { AcademicYear } from '../../../common/value-objects/academic-year.vo';

/**
 * Entité Attestation - Aggregate Root
 * Représente une attestation de réattestation annuelle pour une demande
 */
@Entity('attestations')
export class Attestation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true, name: 'demande_id' })
  demandeId: string;

  @Column({ type: 'varchar', length: 4, name: 'annee_universitaire' })
  anneeUniversitaire: string; // Stocke l'année (ex: "2025")

  @Column({ type: 'date', name: 'date_debut' })
  dateDebut: Date;

  @Column({ type: 'date', name: 'date_fin' })
  dateFin: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'date_attestation' })
  dateAttestation: Date | null;

  @Column({
    type: 'enum',
    enum: AttestationStatus,
    default: AttestationStatus.PENDING,
  })
  statut: AttestationStatus;

  @Column({ type: 'text', nullable: true })
  commentaire: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'date_rappel' })
  dateRappel: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'date_creation' })
  dateCreation: Date;

  // Relations
  @OneToOne(() => Demande, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'demande_id' })
  demande: Demande;

  // Domain methods
  /**
   * Confirme l'attestation
   */
  confirmer(): void {
    if (this.statut !== AttestationStatus.PENDING) {
      throw new Error('Seule une attestation en attente peut être confirmée');
    }
    this.statut = AttestationStatus.CONFIRMED;
    this.dateAttestation = new Date();
  }

  /**
   * Expire l'attestation
   */
  expirer(): void {
    if (this.statut === AttestationStatus.CONFIRMED) {
      return; // Déjà confirmée, ne peut pas expirer
    }
    this.statut = AttestationStatus.EXPIRED;
  }

  /**
   * Vérifie si l'attestation est due (date de fin passée)
   */
  estDue(): boolean {
    return new Date() > this.dateFin && this.statut === AttestationStatus.PENDING;
  }

  /**
   * Retourne l'année universitaire comme Value Object
   */
  obtenirAnneeUniversitaire(): AcademicYear {
    return AcademicYear.fromYear(this.anneeUniversitaire);
  }

  /**
   * Vérifie si un rappel doit être envoyé
   */
  doitEnvoyerRappel(joursAvantExpiration: number = 30): boolean {
    if (this.statut !== AttestationStatus.PENDING) {
      return false;
    }
    
    // Ensure dateFin is a valid Date
    if (!this.dateFin || !(this.dateFin instanceof Date)) {
      return false;
    }
    
    const aujourdhui = new Date();
    const joursRestants = Math.ceil(
      (this.dateFin.getTime() - aujourdhui.getTime()) / (1000 * 60 * 60 * 24),
    );
    
    const dernierRappel = this.dateRappel && this.dateRappel instanceof Date
      ? Math.ceil((aujourdhui.getTime() - this.dateRappel.getTime()) / (1000 * 60 * 60 * 24))
      : Infinity;
      
    return joursRestants <= joursAvantExpiration && dernierRappel >= 7; // Pas de rappel si envoyé il y a moins de 7 jours
  }
}

