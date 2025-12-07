import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Utilisateur } from '../../user-management/entities/utilisateur.entity';
import { DemandeLogiciel } from './demande-logiciel.entity';
import { RequestStatus } from '../../../common/value-objects/request-status.vo';
import { AcademicYear } from '../../../common/value-objects/academic-year.vo';
import { SoftwareInstallationStatus } from '../../../common/value-objects/software-installation-status.vo';

/**
 * Entité Demande - Aggregate Root
 * Représente une demande d'installation de logiciels pédagogiques
 */
@Entity('demandes')
export class Demande {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'enseignant_id' })
  enseignantId: string;

  @CreateDateColumn({ type: 'timestamp', name: 'date_creation' })
  dateCreation: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true, name: 'date_derniere_modification' })
  dateDerniereModification: Date | null;

  @Column({ type: 'date', name: 'date_souhaitee' })
  dateSouhaitee: Date;

  @Column({ type: 'varchar', length: 4, name: 'annee_universitaire' })
  anneeUniversitaire: string; // Stocke l'année (ex: "2025")

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.NOUVELLE,
  })
  etat: RequestStatus;

  @Column({ type: 'text', nullable: true })
  commentaire: string | null;

  @Column({ type: 'text', nullable: true, name: 'commentaire_fermeture' })
  commentaireFermeture: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'date_fermeture' })
  dateFermeture: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'date_expiration' })
  dateExpiration: Date | null;

  // Relations
  @ManyToOne(() => Utilisateur, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enseignant_id' })
  enseignant: Utilisateur;

  @OneToMany(() => DemandeLogiciel, (dl) => dl.demande, {
    cascade: true,
    eager: false,
  })
  demandeLogiciels: DemandeLogiciel[];

  // Domain methods (la logique métier sera dans le service)
  /**
   * Vérifie si la demande peut être modifiée
   */
  peutEtreModifiee(): boolean {
    if (this.etat === RequestStatus.INSTALLEE) return false;
    if (this.etat === RequestStatus.EXPIREE) return false;
    if (this.etat === RequestStatus.FERMEE) return false;
    return true;
  }

  /**
   * Vérifie si la demande peut être fermée
   */
  peutEtreFermee(): boolean {
    return (
      this.etat === RequestStatus.NOUVELLE || this.etat === RequestStatus.EN_COURS
    );
  }

  /**
   * Vérifie si la demande peut être supprimée
   */
  peutEtreSupprimee(): boolean {
    return this.etat !== RequestStatus.FERMEE;
  }

  /**
   * Retourne l'année universitaire comme Value Object
   */
  obtenirAnneeUniversitaire(): AcademicYear {
    return AcademicYear.fromYear(this.anneeUniversitaire);
  }
}

