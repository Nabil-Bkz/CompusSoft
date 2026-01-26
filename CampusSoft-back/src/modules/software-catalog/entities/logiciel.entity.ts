import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { SoftwareVersion } from '../../../common/value-objects/software-version.vo';
import { Salle } from '@/modules/infrastructure/entities/salle.entity';

/**
 * Entité Logiciel - Aggregate Root
 * Représente un logiciel pédagogique
 */
@Entity('logiciels')
export class Logiciel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nom: string;

  @Column({ type: 'varchar', length: 255 })
  editeur: string;

  @Column({ type: 'varchar', length: 50 })
  version: string; // Stocke la version en string (ex: "1.2.3")

  @Column({ type: 'varchar', length: 255, nullable: true })
  usage: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', name: 'duree_max', default: 365 })
  dureeMax: number; // Durée maximale en jours (max 1 an = 365 jours)

  @Column({ type: 'varchar', length: 255, nullable: true })
  licence: string;

  @Column({ type: 'varchar', length: 500, name: 'logo_url', nullable: true })
  logoUrl: string;

  @CreateDateColumn({ type: 'timestamp', name: 'date_ajout' })
  dateAjout: Date;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @ManyToMany(() => Salle, (salle) => salle.logiciels)
  salles: Salle[];

  // Domain methods
  /**
   * Obtient la version du logiciel comme SoftwareVersion Value Object
   */
  obtenirVersion(): SoftwareVersion {
    return SoftwareVersion.fromString(this.version);
  }

  /**
   * Définit la version du logiciel
   */
  definirVersion(version: SoftwareVersion): void {
    this.version = version.toString();
  }

  /**
   * Vérifie si la durée maximale est valide (max 1 an)
   */
  dureeMaxValide(): boolean {
    return this.dureeMax > 0 && this.dureeMax <= 365;
  }
}

