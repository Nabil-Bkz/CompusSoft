import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DemandeLogiciel } from './demande-logiciel.entity';
import { Salle } from '../../infrastructure/entities/salle.entity';

/**
 * Entité DemandeLogicielSalle - Entity
 * Représente l'installation d'un logiciel dans une salle spécifique
 */
@Entity('demande_logiciel_salles')
export class DemandeLogicielSalle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'demande_logiciel_id' })
  demandeLogicielId: string;

  @Column({ type: 'uuid', name: 'salle_id' })
  salleId: string;

  @CreateDateColumn({ type: 'timestamp', name: 'date_assignation' })
  dateAssignation: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'date_installation' })
  dateInstallation: Date | null;

  @Column({ type: 'boolean', default: false, name: 'est_installee' })
  estInstallee: boolean;

  @Column({ type: 'text', nullable: true, name: 'commentaire_installation' })
  commentaireInstallation: string | null;

  @UpdateDateColumn({ type: 'timestamp', nullable: true, name: 'date_derniere_modification' })
  dateDerniereModification: Date | null;

  // Relations
  @ManyToOne(() => DemandeLogiciel, (dl) => dl.demandeLogicielSalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'demande_logiciel_id' })
  demandeLogiciel: DemandeLogiciel;

  @ManyToOne(() => Salle, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'salle_id' })
  salle: Salle;

  // Domain methods
  /**
   * Marque le logiciel comme installé dans cette salle
   */
  marquerInstallee(dateInstallation: Date, commentaire?: string): void {
    this.estInstallee = true;
    this.dateInstallation = dateInstallation;
    if (commentaire) {
      this.commentaireInstallation = commentaire;
    }
    this.dateDerniereModification = new Date();
  }

  /**
   * Marque le logiciel comme non installé dans cette salle
   */
  marquerNonInstallee(commentaire?: string): void {
    this.estInstallee = false;
    this.dateInstallation = null;
    if (commentaire) {
      this.commentaireInstallation = commentaire;
    }
    this.dateDerniereModification = new Date();
  }

  /**
   * Met à jour le statut d'installation
   */
  mettreAJourStatut(
    estInstallee: boolean,
    dateInstallation?: Date,
    commentaire?: string,
  ): void {
    this.estInstallee = estInstallee;
    if (estInstallee) {
      this.dateInstallation = dateInstallation || new Date();
    } else {
      this.dateInstallation = null;
    }
    if (commentaire !== undefined) {
      this.commentaireInstallation = commentaire;
    }
    this.dateDerniereModification = new Date();
  }

  /**
   * Retourne le statut d'installation
   */
  obtenirStatutInstallation(): boolean {
    return this.estInstallee;
  }
}

