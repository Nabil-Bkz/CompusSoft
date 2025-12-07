import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Demande } from '../../request-management/entities/demande.entity';
import { DemandeLogiciel } from '../../request-management/entities/demande-logiciel.entity';
import { Logiciel } from '../../software-catalog/entities/logiciel.entity';
import { Utilisateur } from '../../user-management/entities/utilisateur.entity';
import { RequestStatus } from '../../../common/value-objects/request-status.vo';
import { SoftwareInstallationStatus } from '../../../common/value-objects/software-installation-status.vo';

/**
 * Types d'actions pour l'historique
 */
export enum TypeActionHistorique {
  INSTALLATION = 'installation',
  DESINSTALLATION = 'désinstallation',
  MODIFICATION_DEMANDE = 'modification_demande',
  MODIFICATION_LOGICIEL = 'modification_logiciel',
  CHANGEMENT_STATUT = 'changement_statut',
  CHANGEMENT_STATUT_INSTALLATION = 'changement_statut_installation',
  FERMETURE = 'fermeture',
  CREATION_DEMANDE = 'création_demande',
}

/**
 * Entité Historique - Aggregate Root
 * Représente un enregistrement d'historique immuable pour la traçabilité
 */
@Entity('historique')
@Index(['demandeId', 'dateAction'])
@Index(['logicielId', 'dateAction'])
@Index(['utilisateurId', 'dateAction'])
export class Historique {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'demande_id' })
  demandeId: string;

  @Column({ type: 'uuid', nullable: true, name: 'demande_logiciel_id' })
  demandeLogicielId: string | null;

  @Column({ type: 'uuid', name: 'logiciel_id' })
  logicielId: string;

  @Column({
    type: 'enum',
    enum: TypeActionHistorique,
    name: 'type_action',
  })
  typeAction: TypeActionHistorique;

  @CreateDateColumn({ type: 'timestamp', name: 'date_action' })
  dateAction: Date;

  @Column({ type: 'uuid', name: 'utilisateur_id' })
  utilisateurId: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    nullable: true,
    name: 'ancien_etat',
  })
  ancienEtat: RequestStatus | null;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    nullable: true,
    name: 'nouvel_etat',
  })
  nouvelEtat: RequestStatus | null;

  @Column({
    type: 'enum',
    enum: SoftwareInstallationStatus,
    nullable: true,
    name: 'ancien_statut_installation',
  })
  ancienStatutInstallation: SoftwareInstallationStatus | null;

  @Column({
    type: 'enum',
    enum: SoftwareInstallationStatus,
    nullable: true,
    name: 'nouveau_statut_installation',
  })
  nouveauStatutInstallation: SoftwareInstallationStatus | null;

  @Column({ type: 'text', nullable: true })
  commentaire: string | null;

  // Relations (optionnelles pour éviter les problèmes de circularité)
  @ManyToOne(() => Demande, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'demande_id' })
  demande: Demande;

  @ManyToOne(() => DemandeLogiciel, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'demande_logiciel_id' })
  demandeLogiciel: DemandeLogiciel;

  @ManyToOne(() => Logiciel, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'logiciel_id' })
  logiciel: Logiciel;

  @ManyToOne(() => Utilisateur, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur: Utilisateur;

  // Domain methods
  /**
   * Enregistre une action dans l'historique
   */
  static creerAction(data: {
    demandeId: string;
    demandeLogicielId?: string | null;
    logicielId: string;
    utilisateurId: string;
    typeAction: TypeActionHistorique;
    ancienEtat?: RequestStatus | null;
    nouvelEtat?: RequestStatus | null;
    ancienStatutInstallation?: SoftwareInstallationStatus | null;
    nouveauStatutInstallation?: SoftwareInstallationStatus | null;
    commentaire?: string | null;
  }): Partial<Historique> {
    return {
      demandeId: data.demandeId,
      demandeLogicielId: data.demandeLogicielId || null,
      logicielId: data.logicielId,
      utilisateurId: data.utilisateurId,
      typeAction: data.typeAction,
      ancienEtat: data.ancienEtat || null,
      nouvelEtat: data.nouvelEtat || null,
      ancienStatutInstallation: data.ancienStatutInstallation || null,
      nouveauStatutInstallation: data.nouveauStatutInstallation || null,
      commentaire: data.commentaire || null,
    };
  }
}

