import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Demande } from './demande.entity';
import { Logiciel } from '../../software-catalog/entities/logiciel.entity';
import { DemandeLogicielSalle } from './demande-logiciel-salle.entity';
import { SoftwareInstallationStatus } from '../../../common/value-objects/software-installation-status.vo';
import { calculateInstallationStatus } from '../../../common/value-objects/software-installation-status.vo';

/**
 * Entité DemandeLogiciel - Entity
 * Représente un logiciel demandé dans une demande avec son statut d'installation
 */
@Entity('demande_logiciels')
export class DemandeLogiciel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'demande_id' })
  demandeId: string;

  @Column({ type: 'uuid', name: 'logiciel_id' })
  logicielId: string;

  @Column({
    type: 'enum',
    enum: SoftwareInstallationStatus,
    default: SoftwareInstallationStatus.EN_ATTENTE,
    name: 'statut_installation',
  })
  statutInstallation: SoftwareInstallationStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'date_installation' })
  dateInstallation: Date | null;

  @Column({ type: 'text', nullable: true })
  commentaire: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'date_changement' })
  dateChangement: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'date_creation' })
  dateCreation: Date;

  // Relations
  @ManyToOne(() => Demande, (demande) => demande.demandeLogiciels, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'demande_id' })
  demande: Demande;

  @ManyToOne(() => Logiciel, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'logiciel_id' })
  logiciel: Logiciel;

  @OneToMany(() => DemandeLogicielSalle, (dls) => dls.demandeLogiciel, {
    cascade: true,
    eager: false,
  })
  demandeLogicielSalles: DemandeLogicielSalle[];

  // Domain methods (à implémenter dans le service car nécessite les relations chargées)
}

